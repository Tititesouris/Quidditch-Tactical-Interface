let dataTextArea = document.getElementById("data-txtarea");

let download = function(filename, text) {
  let element = document.createElement("a");
  element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

let importData = function() {
    let data = JSON.retrocycle(JSON.parse(dataTextArea.value));
    interface = new Interface();
    console.log(data);
    for (let i = 0; i < data.length; i++) {
        let players = data[i].players;
        for (let iPlayer = 0; iPlayer < data[i].players.length; iPlayer++) {
            Object.setPrototypeOf(players[iPlayer], Player.prototype);
        }
        balls = data[i].balls;
        for (let iBall = 0; iBall < data[i].balls.length; iBall++) {
            Object.setPrototypeOf(balls[iBall], Ball.prototype);
        }
        interface.addFrame(players, balls);
    }
    interface.goToFrame(0);
};

let exportData = function() {
    dataTextArea.value = JSON.stringify(JSON.decycle(interface.frames));
    download("QuidditchTactics_" + new Date().toISOString().substring(0, 19).replace(/:/g, "-") + ".json", dataTextArea.value);
};


document.getElementById("import-btn").addEventListener("click", importData, false);
document.getElementById("export-btn").addEventListener("click", exportData, false);