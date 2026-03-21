// ================== ELECTION STATE ==================
let electionStarted = JSON.parse(localStorage.getItem("electionStarted")) || false;

// ================== EDIT MODE ==================
let editMode = false;
let currentView = "";

// ================== ADMIN ==================
const defaultAdmin = {
    name: "Admin",
    email: "kalpeshborse9921@gmail.com",
    pass: "Kal@pesh9699",
    role: "admin",
    manifesto: "",
    hasVoted: false
};

// ================== STORAGE ==================
let users = JSON.parse(localStorage.getItem("users")) || [];
let votes = JSON.parse(localStorage.getItem("votes")) || {};
let currentUser = null;

// ================== OTP ==================
let otpInput = resetOTP.value;
let newPass = newPass.value;

// ================== ADD DEFAULT ADMIN ==================
if (!users.find(u => u.email === defaultAdmin.email)) {
    users.push(defaultAdmin);
    localStorage.setItem("users", JSON.stringify(users));
}

// ================== INITIAL LOAD ==================
window.onload = function () {

    hideAll();
    document.getElementById("dashboard").style.display = "block";

    updateElectionButton();
};

// ================== NAVIGATION ==================
function hideAll() {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
}

function show(id) {
    hideAll();
    document.getElementById(id).style.display = "block";
}

// ================== PASSWORD TOGGLE ==================
function togglePassword() {

    let pass = document.getElementById("loginPass");

    pass.type = pass.type === "password" ? "text" : "password";
}

// ================== PRN ==================
function getPRN(email) {
    return email.split("@")[0].split(".")[1];
}

// ================== OTP ==================
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// ================== SEND REGISTER OTP ==================
function sendRegisterOTP(){

let email = document.getElementById("remail").value;

registerOTP = generateOTP();

alert("OTP sent to email (Demo OTP: "+registerOTP+")");

}

// ================== REGISTER ==================
function verifyRegisterOTP(){

let name = document.getElementById("rname").value.trim();
let email = document.getElementById("remail").value.trim().toLowerCase();
let pass = document.getElementById("rpass").value;
let role = document.getElementById("rrole").value;
let userOTP = document.getElementById("registerOTP").value;

if(!name || !email || !pass){
alert("Fill all fields");
return;
}

if(userOTP != registerOTP){
alert("Invalid OTP");
return;
}

if(users.find(u=>u.email===email)){
alert("User already exists");
return;
}

users.push({
name,
email,
pass,
role,
prn:getPRN(email),
manifesto:"",
hasVoted:false
});

localStorage.setItem("users",JSON.stringify(users));

alert("Registration Successful");

show("dashboard");

}

// ================== LOGIN ==================
function login() {

    let email = loginEmail.value;
    let pass = loginPass.value;
    let role = loginRole.value;

    if (email === defaultAdmin.email && pass === defaultAdmin.pass) {
        currentUser = defaultAdmin;
        showAdminPanel();
        return;
    }

    let user = users.find(u =>
        u.email === email &&
        u.pass === pass &&
        u.role === role
    );

    if (!user) {
        alert("Invalid credentials");
        return;
    }

    currentUser = user;

    if (role === "voter") showVoterPanel();
    if (role === "candidate") showCandidatePanel();
}

// ================== FORGOT PASSWORD ==================
function showForgot() {
    show("forgotSection");
}

function sendResetOTP() {

    let email = resetEmail.value;

    if (!users.find(u => u.email === email)) {
        alert("Email not registered");
        return;
    }

    resetOTP = generateOTP();

    alert("OTP sent to email (Demo OTP: " + resetOTP + ")");
}

function resetPassword(){

let email = document.getElementById("resetEmail").value;
let otpInput = document.getElementById("resetOTP").value;
let newPassword = document.getElementById("newPass").value;

if(otpInput != resetOTP){
alert("Wrong OTP");
return;
}

let user = users.find(u => u.email === email);

if(!user){
alert("User not found");
return;
}

user.pass = newPassword;

localStorage.setItem("users", JSON.stringify(users));

alert("Password Reset Successful");

show("dashboard");

}

// ================== VOTER PANEL ==================
function showVoterPanel() {

    hideAll();
    voter.style.display = "block";

    let list = document.getElementById("candidateList");

    let candidates = users.filter(u => u.role === "candidate");

    list.innerHTML = "<h3>Candidates</h3>";

    candidates.forEach(c => {

        let voteBtn = currentUser.hasVoted
            ? "<button disabled>Already Voted</button>"
            : `<button onclick="castVote('${c.email}')">Vote</button>`;

        list.innerHTML += `
        <div style="border:1px solid #ccc;padding:10px;margin:5px;">
        <b>${c.name}</b> (PRN: ${c.prn})<br>
        <p>${c.manifesto || "No manifesto"}</p>
        ${voteBtn}
        </div>`;
    });
}

// ================== CAST VOTE ==================
function castVote(candidateEmail) {

    if (!electionStarted) {
        alert("Election not started!");
        return;
    }

    if (currentUser.hasVoted) {
        alert("You already voted!");
        return;
    }

    votes[candidateEmail] = (votes[candidateEmail] || 0) + 1;

    currentUser.hasVoted = true;

    let index = users.findIndex(u => u.email === currentUser.email);
    users[index] = currentUser;

    localStorage.setItem("votes", JSON.stringify(votes));
    localStorage.setItem("users", JSON.stringify(users));

    alert("Vote cast successfully!");

    showVoterPanel();
}

// ================== CANDIDATE PANEL ==================
function showCandidatePanel() {

    hideAll();

    candidate.style.display = "block";

    manifesto.value = currentUser.manifesto || "";
}

function saveManifesto() {

    currentUser.manifesto = manifesto.value;

    let index = users.findIndex(u => u.email === currentUser.email);

    users[index] = currentUser;

    localStorage.setItem("users", JSON.stringify(users));

    candMsg.innerText = "Manifesto Saved!";
}

// ================== ADMIN PANEL ==================
function showAdminPanel() {

    hideAll();

    adminPanel.style.display = "block";

    updateElectionButton();

    loadAdminDashboard();
}

// ================== ADMIN DASHBOARD ==================
function loadAdminDashboard() {

    let candidates = users.filter(u => u.role === "candidate");

    if (candidates.length === 0) {
        adminResults.innerHTML = "No candidates";
        return;
    }

    let result = candidates.map(c => ({
        name: c.name,
        vote: votes[c.email] || 0
    })).sort((a, b) => b.vote - a.vote);

    let html = "<h3>Results</h3>";

    result.forEach(c => {
        html += `<div>${c.name} - ${c.vote}</div>`;
    });

    let winner = result[0];
    let margin = result[1] ? winner.vote - result[1].vote : winner.vote;

    html += `<h4>Winner 🏆: ${winner.name}</h4>`;
    html += `<p>Winning Margin: ${margin}</p>`;

    adminResults.innerHTML = html;
}

// ================== VIEW VOTERS ==================
function showVoters() {

    currentView = "voters";
    editMode = false;
    renderVoterTable();
}

function renderVoterTable(searchValue = "") {

    let voters = users.filter(u => u.role === "voter");

    if (searchValue) {
        searchValue = searchValue.toLowerCase();
        voters = voters.filter(v =>
            v.name.toLowerCase().includes(searchValue) ||
            getPRN(v.email).includes(searchValue)
        );
    }

    let html = `
    <h3>Voter List</h3>
    <input type="text" placeholder="Search by Name or PRN"
    onkeyup="renderVoterTable(this.value)">

    <br><br>

    <button onclick="exportVotersToExcel()">📁 Export to Excel</button>
    <button onclick="toggleEdit()">✏️ Edit</button>

    <table border="1" width="100%" cellpadding="5">
    <tr>
    <th>Sr No</th>
    <th>Name</th>
    <th>PRN</th>
    <th>Email</th>
    <th>Voted</th>
    ${editMode ? "<th>Select</th>" : ""}
    </tr>
    `;

    voters.forEach((v, index) => {

        html += `
        <tr>
        <td>${index + 1}</td>
        <td>${v.name}</td>
        <td>${getPRN(v.email)}</td>
        <td>${v.email}</td>
        <td>${v.hasVoted ? "Yes" : "No"}</td>
        ${editMode ? `<td><input type="checkbox" value="${v.email}"></td>` : ""}
        </tr>`;
    });

    html += "</table>";

    if (editMode) {
        html += `<br><button onclick="removeSelected()">Remove Selected</button>`;
    }

    adminContent.innerHTML = html;
}

// ================== VIEW CANDIDATES ==================
function showCandidates() {

    currentView = "candidates";
    editMode = false;
    renderCandidateTable();
}

function renderCandidateTable(searchValue = "") {

    let candidates = users.filter(u => u.role === "candidate");

    if (searchValue) {
        searchValue = searchValue.toLowerCase();
        candidates = candidates.filter(c =>
            c.name.toLowerCase().includes(searchValue) ||
            getPRN(c.email).includes(searchValue)
        );
    }

    let html = `
    <h3>Candidate List</h3>
    <input type="text" placeholder="Search by Name or PRN"
    onkeyup="renderCandidateTable(this.value)">

    <br><br>
    <button onclick="toggleEdit()">✏️ Edit</button>

    <table border="1" width="100%" cellpadding="5">
    <tr>
    <th>Sr No</th>
    <th>Name</th>
    <th>PRN</th>
    <th>Email</th>
    <th>Votes</th>
    ${editMode ? "<th>Select</th>" : ""}
    </tr>
    `;

    candidates.forEach((c, index) => {

        html += `
        <tr>
        <td>${index + 1}</td>
        <td>${c.name}</td>
        <td>${getPRN(c.email)}</td>
        <td>${c.email}</td>
        <td>${votes[c.email] || 0}</td>
        ${editMode ? `<td><input type="checkbox" value="${c.email}"></td>` : ""}
        </tr>`;
    });

    html += "</table>";

    if (editMode) {
        html += `<br><button onclick="removeSelected()">Remove Selected</button>`;
    }

    adminContent.innerHTML = html;
}

// ================== TOGGLE EDIT ==================
function toggleEdit() {

    editMode = !editMode;

    if (currentView === "voters") renderVoterTable();
    if (currentView === "candidates") renderCandidateTable();
}

// ================== START / STOP ELECTION ==================
function toggleElection() {

    electionStarted = !electionStarted;

    localStorage.setItem("electionStarted", JSON.stringify(electionStarted));

    if (electionStarted) alert("Election Started!");
    else alert("Election Stopped!");

    updateElectionButton();
}

function updateElectionButton() {

    let btn = document.getElementById("electionBtn");

    if (!btn) return;

    if (electionStarted) {
        btn.innerText = "🛑 Stop Election";
        btn.style.background = "red";
    } else {
        btn.innerText = "🟢 Start Election";
        btn.style.background = "green";
    }
}

// ================== REMOVE USERS ==================
function removeSelected() {

    let selected = document.querySelectorAll("input[type='checkbox']:checked");

    selected.forEach(box => {

        users = users.filter(u => u.email !== box.value);
        delete votes[box.value];

    });

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("votes", JSON.stringify(votes));

    alert("Users removed!");

    if (currentView === "voters") renderVoterTable();
    if (currentView === "candidates") renderCandidateTable();

    loadAdminDashboard();
}
// ================== RE-ELECTION ==================
function reelection() {

    if (!confirm("Reset all votes?")) return;

    votes = {};

    users.forEach(u => {
        if (u.role === "voter") u.hasVoted = false;
    });

    localStorage.setItem("votes", JSON.stringify(votes));
    localStorage.setItem("users", JSON.stringify(users));

    loadAdminDashboard();
}

// ================== EXPORT VOTERS ==================
function exportVotersToExcel() {

    let voters = users.filter(u => u.role === "voter");

    let data = voters.map((v, i) => ({
        "Sr No": i + 1,
        "Name": v.name,
        "PRN": getPRN(v.email),
        "Email": v.email,
        "Voted": v.hasVoted ? "👍🏻Yes" : "👎🏻No"
    }));

    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Voters");

    XLSX.writeFile(wb, "VIT_Voters_List.xlsx");
}


// ================== EXPORT RESULTS ==================
function exportResultsToExcel() {

    let candidates = users.filter(u => u.role === "candidate");

    let data = candidates.map((c, i) => ({
        No: i + 1,
        Name: c.name,
        PRN: c.prn,
        Email: c.email,
        Votes: votes[c.email] || 0
    }));

    let ws = XLSX.utils.json_to_sheet(data);

    let wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Results");

    XLSX.writeFile(wb, "ElectionResults.xlsx");
}

// ================== LOGOUT ==================
function logout() {
    location.reload();
}