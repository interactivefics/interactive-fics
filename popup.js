document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', clickHandler);
}); //instead of onclick="clickHandler()" in popup.html


function clickHandler(){
var person = document.getElementById("inputTxt").value;
chrome.storage.local.set({"person": person}, chrome.tabs.reload());
}

