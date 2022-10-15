let oversize = 100;

const getNewOversize = () => {
  const oversizeValue = document.getElementById("change-oversize").value;
  oversize = oversizeValue;
  const formText = document.getElementById("form-text");
  formText.innerHTML = 'Текущий размер негабарита ' + oversize + '. <br>Установить новый:';
}
