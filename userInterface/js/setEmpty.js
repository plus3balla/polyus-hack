const setEmpty = (data) => {
    const empty = (data.length == 0);
    document.getElementById("alert-empty").style.backgroundColor = empty ? "#DF5610" : "#60BB0A";
    document.getElementById("alert-empty").style.boxShadow = empty ? 
        "3px 3px 5px #A23D0A, -3px -3px 5px #A23D0A, -3px 3px 5px #A23D0A, 3px -3px 5px #A23D0A" : 
        "3px 3px 5px #418204, -3px -3px 5px #418204, -3px 3px 5px #418204, 3px -3px 5px #418204";
    document.getElementById("alert-empty").innerHTML = empty ? "Пустой участок!" : "Пустого участка нет";
}