
DISABLE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';
document.addEventListener('DOMContentLoaded', function () {

  chrome.storage.local.get(DISABLE_KEY, function(obj){
  	var isDeactivated = obj[DISABLE_KEY] !== true ? false : true;
  	var key = isDeactivated ? 'Re-activate ' : 'Deactivate ';
  	document.getElementById('deactivate').value = key + 'Extension';
  	if(isDeactivated){
  		document.getElementsByTagName("BODY")[0].title = "Extension is disabled";
  		var elements = document.getElementsByTagName("INPUT");
	  	for(var i=0; i<elements.length; i++){
	  		if(elements[i].id !== 'deactivate')
	  			elements[i].disabled = 'disabled';
	  	}
  	}
  });

  document.getElementById('deactivate').addEventListener('click', function(){
  	chrome.storage.local.get(DISABLE_KEY, function(obj){
  		// 1. previous state:
  		var wasDeactivated = obj[DISABLE_KEY] === undefined ? false : true;
  		// 2. button:
  		var key = wasDeactivated ? 'Deactivate ' : 'Re-activate '; 
  		document.getElementById('deactivate').value = key + 'Extension';
  		// 3. storage:
  		if(wasDeactivated){
  			chrome.storage.local.remove(DISABLE_KEY);
  		}
  		else{
  			var obj = {};
	  		obj[DISABLE_KEY] = true;
	  		chrome.storage.local.set(obj);
  		}
  		chrome.tabs.reload();
  		window.close();
  	});
  });
  document.getElementById('submit').addEventListener('click', clickHandler);
  document.getElementById('show-saved').addEventListener('click', function(){
	chrome.storage.local.get(null, function(items){
		var list = document.getElementById('theList');
		list.innerHTML = "";
		for(var key in items){
			if(key !== DISABLE_KEY){
				var k;
				if(key=="person")
					k = "Y/N";
				else
					k = key;
				var v = items[key];
				var rep = k + " -> " + v;
				var text = document.createTextNode(rep);
				var node = document.createElement("LI");
				node.appendChild(text);
				node.id = key;
				node.className = 'one-saved-item';
				node.addEventListener('click', function(){
					chrome.storage.local.remove(this.id);
					this.className+=' strikethrough';
				});
				list.appendChild(node);
			}
		}
	});
  });
  document.getElementById('clear-name').addEventListener('click', function(){ chrome.storage.local.remove("person", chrome.tabs.reload()) } );
  var others = document.getElementsByClassName('changeForm');
  for(var i=0; i<others.length; i++)
  	others[i].addEventListener('submit', otherHandler);
}); //instead of onclick="clickHandler()" in popup.html



function otherHandler(){
	var myInput = this.replaceWord.value;
	if(myInput){
	var valChange = myInput;
	var isYN;
	var replace;
	if(this.replaceWith){
		isYN = false;
		replace = this.replaceWith.value;
		if(this.isPerm.checked){
			var obj = {};
			obj[valChange] = replace;
			chrome.storage.local.set(obj);
		}
	}
	else{
		isYN = true;
		replace = 'NOPE'; // should/will never get accessed
	}

	chrome.tabs.query({active:true,currentWindow:true}, function(tab){
  		chrome.tabs.sendMessage(tab[0].id, {stuff:valChange, isYN: isYN, replaceVal:replace});
	});
 }
}



function clickHandler(){
var person = document.getElementById("inputTxt").value;
if(person)
	chrome.storage.local.set({"person": person}, chrome.tabs.reload());
}

