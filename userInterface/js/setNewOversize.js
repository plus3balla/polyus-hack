const setNewOversize = () => {
    localStorage.setItem("oversize", document.getElementById("change-oversize").value);
    document.getElementById("form-text").innerHTML = 'Текущий размер негабарита ' + localStorage.getItem("oversize") + '. <br>Установить новый:';
    setOversizeAlert(data);
}