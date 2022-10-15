const hasOversize = (data) => {
    const n_data = data.length;
    const over = localStorage.getItem("oversize");
    for (let i = 0; i < n_data; ++i) {
        let [x1, y1, x2, y2] = data[i];
        const a = Math.max(x2 - x1, y2 - y1);
        if (a > over) return true;
    }
    return false;
}

const setOversizeAlert = (data) => {
    const over = hasOversize(data);
    document.getElementById("alert-oversize").style.backgroundColor = over ? "#DF5610" : "#60BB0A";
    document.getElementById("alert-oversize").style.boxShadow = over ? 
        "3px 3px 5px #A23D0A, -3px -3px 5px #A23D0A, -3px 3px 5px #A23D0A, 3px -3px 5px #A23D0A" : 
        "3px 3px 5px #418204, -3px -3px 5px #418204, -3px 3px 5px #418204, 3px -3px 5px #418204";
    document.getElementById("alert-oversize").innerHTML = over ? "Негабарит!" : "Негабарита нет";
}