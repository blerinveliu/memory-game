// 1. LIDHJA ME SUPABASE
const SUPABASE_URL = 'https://yhsdzjxfmifkkwxqiezk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_miqVE3_QQJvbpu8n4Ua2eQ_ImjPNsM3'; 
const supabaseKlient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. ELEMENTËT E DOM
const zonaAuth = document.getElementById("zona-auth");
const zonaLojes = document.getElementById("zona-lojes");
const authTitulli = document.getElementById("auth-titulli");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const inputUsername = document.getElementById("username");
const btnAuth = document.getElementById("btn-auth");
const authMesazhi = document.getElementById("auth-mesazhi");
const toggleAuth = document.getElementById("toggle-auth");
const btnDil = document.getElementById("btn-dil");

const rrjeta = document.getElementById("loja");
const elLevizjet = document.getElementById("levizjet");
const elCiftet = document.getElementById("ciftet");
const btnRifillo = document.getElementById("btn-rifillo");
const listaRenditjes = document.getElementById("lista-renditjes");

// Elementët e statistikave (Të reja)
const statLojerat = document.getElementById("stat-lojerat");
const statRekordi = document.getElementById("stat-rekordi");
const statMesatarja = document.getElementById("stat-mesatarja");

// 3. NDRYSHORËT E LOJËS
const simbolet = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🥝", "🍍"];
let kartatEzgjedhura = [];
let levizjet = 0;
let ciftetEGjetura = 0;
let bllokim = false;

// Ndryshore per Autentikimin
let eshteRegjistrim = true;
let perdoruesiAktual = null;

// 4. KONTROLLI I AUTENTIKIMIT
supabaseKlient.auth.onAuthStateChange((event, session) => {
  if (session) {
    perdoruesiAktual = session.user;
    zonaAuth.style.display = "none";
    zonaLojes.style.display = "flex";
    shfaqRenditjen();
    shfaqStatistikat(); // Shtuar per statistikat
  } else {
    perdoruesiAktual = null;
    zonaAuth.style.display = "block";
    zonaLojes.style.display = "none";
    listaRenditjes.innerHTML = "<li>Kyçu për të parë renditjen.</li>";
  }
});

// Ndërro midis Login dhe Regjistrim
toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  eshteRegjistrim = !eshteRegjistrim;
  authMesazhi.textContent = "";
  
  if (eshteRegjistrim) {
    authTitulli.textContent = "Regjistrohu për të luajtur";
    btnAuth.textContent = "Regjistrohu";
    inputUsername.style.display = "block";
    toggleAuth.textContent = "Ke llogari? Kyçu këtu.";
  } else {
    authTitulli.textContent = "Kyçu në llogarinë tënde";
    btnAuth.textContent = "Kyçu";
    inputUsername.style.display = "none";
    toggleAuth.textContent = "Nuk ke llogari? Regjistrohu këtu.";
  }
});

// Klikimi i butonit të Regjistrimit / Login
btnAuth.addEventListener("click", async () => {
  const email = inputEmail.value.trim();
  const password = inputPassword.value;
  const username = inputUsername.value.trim();

  if (!email || !password) {
    authMesazhi.textContent = "Plotësoni email dhe fjalëkalimin!";
    authMesazhi.style.color = "#ff6b6b";
    return;
  }

  btnAuth.disabled = true;
  authMesazhi.textContent = "Duke procesuar...";
  authMesazhi.style.color = "white";

  if (eshteRegjistrim) {
    if (!username) {
      authMesazhi.textContent = "Shkruani emrin e lojtarit!";
      authMesazhi.style.color = "#ff6b6b";
      btnAuth.disabled = false;
      return;
    }

    // Regjistrimi
    const { data, error } = await supabaseKlient.auth.signUp({ email, password });
    
    if (error) {
      authMesazhi.textContent = "Gabim: " + error.message;
      authMesazhi.style.color = "#ff6b6b";
    } else if (data.user) {
      // Ruajmë username në tabelën profiles
      const { error: profileError } = await supabaseKlient.from('profiles').insert([{ id: data.user.id, username: username }]);
      
      if (profileError) {
        console.error("Gabim gjatë ruajtjes së profilit:", profileError);
        authMesazhi.textContent = "Gabim gjatë ruajtjes së emrit: " + profileError.message;
        authMesazhi.style.color = "#ff6b6b";
      } else {
        authMesazhi.textContent = "U regjistruat me sukses! Tani mund të kyçeni.";
        authMesazhi.style.color = "#a8e6cf";
        // Ktheje ne formen e login-it
        eshteRegjistrim = false;
        authTitulli.textContent = "Kyçu në llogarinë tënde";
        btnAuth.textContent = "Kyçu";
        inputUsername.style.display = "none";
        toggleAuth.textContent = "Nuk ke llogari? Regjistrohu këtu.";
      }
    }
  } else {
    // Login
    const { error } = await supabaseKlient.auth.signInWithPassword({ email, password });
    if (error) {
      authMesazhi.textContent = "Gabim: " + error.message;
      authMesazhi.style.color = "#ff6b6b";
    }
  }
  btnAuth.disabled = false;
});

// Dil nga llogaria
btnDil.addEventListener("click", async () => {
  await supabaseKlient.auth.signOut();
});

// 5. FUNKSIONET E LOJËS
function perziej(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function krijoKartat() {
  rrjeta.innerHTML = "";
  kartatEzgjedhura = [];
  levizjet = 0;
  ciftetEGjetura = 0;
  bllokim = false;
  elLevizjet.textContent = 0;
  elCiftet.textContent = 0;

  const teGjitha = perziej([...simbolet, ...simbolet]);

  teGjitha.forEach((simbol) => {
    const karte = document.createElement("div");
    karte.classList.add("karte");
    karte.dataset.simbol = simbol;
    karte.innerHTML = `
      <div class="karte-inner">
        <div class="ballina">?</div>
        <div class="mbrapa">${simbol}</div>
      </div>
    `;
    karte.addEventListener("click", () => kthyeKarten(karte));
    rrjeta.appendChild(karte);
  });
}

function kthyeKarten(karte) {
  if (bllokim) return;
  if (karte.classList.contains("e-kthyer")) return;
  if (karte.classList.contains("e-gjetur")) return;

  karte.classList.add("e-kthyer");
  kartatEzgjedhura.push(karte);

  if (kartatEzgjedhura.length === 2) {
    levizjet++;
    elLevizjet.textContent = levizjet;
    kontrolloCiftin();
  }
}

async function kontrolloCiftin() {
  const [karta1, karta2] = kartatEzgjedhura;
  const eshteCift = karta1.dataset.simbol === karta2.dataset.simbol;

  if (eshteCift) {
    karta1.classList.add("e-gjetur");
    karta2.classList.add("e-gjetur");
    ciftetEGjetura++;
    elCiftet.textContent = ciftetEGjetura;
    kartatEzgjedhura = [];

    if (ciftetEGjetura === simbolet.length) {
      // Loja mbaroi
      setTimeout(async () => {
        if (!perdoruesiAktual) return alert("Duhet të jesh i kyçur për të ruajtur rezultatin!");

        // Marrim username nga tabela profiles
        const { data: profili } = await supabaseKlient
          .from('profiles')
          .select('username')
          .eq('id', perdoruesiAktual.id)
          .single();

        const emri = profili ? profili.username : "Lojtar anonim";

        // Ruaj rezultatin BASHKË ME user_id
        const { error } = await supabaseKlient
          .from('leaderboard')
          .insert([{ 
              player_name: emri, 
              moves: levizjet, 
              user_id: perdoruesiAktual.id 
          }]);

        if (error) {
          console.error("GABIM:", error);
          alert('Pati një problem gjatë ruajtjes: ' + error.message);
        } else {
          alert(`Urime ${emri}! Rezultati (${levizjet} lëvizje) u ruajt me sukses! 🏆`);
          shfaqRenditjen();
          shfaqStatistikat(); // Rifresko statistikat pas lojës
        }
      }, 400);
    }
  } else {
    bllokim = true;
    setTimeout(() => {
      karta1.classList.remove("e-kthyer");
      karta2.classList.remove("e-kthyer");
      kartatEzgjedhura = [];
      bllokim = false;
    }, 900);
  }
}

// 6. RENDITJA GLOBALE
async function shfaqRenditjen() {
  if (!listaRenditjes) return;
  
  const { data, error } = await supabaseKlient
    .from('leaderboard')
    .select('player_name, moves')
    .order('moves', { ascending: true })
    .limit(5);

  if (error) {
    listaRenditjes.innerHTML = "<li>Nuk mund të ngarkohet renditja.</li>";
    return;
  }

  listaRenditjes.innerHTML = ""; 
  if (data.length === 0) {
    listaRenditjes.innerHTML = "<li>Nuk ka rezultate ende. Bëhu i pari!</li>";
    return;
  }

  data.forEach((rreshti) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${rreshti.player_name}</strong> — ${rreshti.moves} lëvizje`;
    listaRenditjes.appendChild(li);
  });
}

// 7. STATISTIKAT PERSONALE (E RE)
async function shfaqStatistikat() {
  if (!perdoruesiAktual) return;

  // Marrim të gjitha rezultatet e këtij përdoruesi
  const { data, error } = await supabaseKlient
    .from('leaderboard')
    .select('moves')
    .eq('user_id', perdoruesiAktual.id);

  if (error) {
    console.error("Gabim gjatë marrjes së statistikave:", error);
    return;
  }

  // Nëse nuk ka luajtur asnjë lojë ende
  if (data.length === 0) {
    statLojerat.textContent = "0";
    statRekordi.textContent = "-";
    statMesatarja.textContent = "-";
    return;
  }

  // Llogaritjet
  const totalLojera = data.length;
  let minLevizjet = Math.min(...data.map(d => d.moves));
  let totalLevizjet = data.reduce((sum, d) => sum + d.moves, 0);
  let mesatarja = Math.round(totalLevizjet / totalLojera);

  // Shfaqja në ekran
  statLojerat.textContent = totalLojera;
  statRekordi.textContent = minLevizjet;
  statMesatarja.textContent = mesatarja;
}

// 8. NISJA
btnRifillo.addEventListener("click", krijoKartat);
krijoKartat();