highlight();

 
function toggleDialog(dialog, mainPage){
   var el = document.getElementById(dialog)
   if(el.style.display == "none"){
      document.getElementById(mainPage).style.filter = "brightness(75%)"
      document.getElementById(dialog).style.display = "block"     
   }
   else{
      document.getElementById(mainPage).style.filter = "brightness(100%)"
      document.getElementById(dialog).style.display = "none"
   }
}
 
// for date time
var dt = new Date();
document.getElementById("datetime").innerHTML = (("0" + (dt.getMonth() + 1)).slice(-2)) + "/" + (("0" + dt.getDate()).slice(-2)) + "/" + (dt.getFullYear()) + " " + (("0" + dt.getHours() + 1).slice(-2)) + ":" + (("0" + dt.getMinutes() + 1).slice(-2));

//HIGHLIGHT FILE MAINTENANCE IN SIDEBAR 
function highlight() {
   function emphasize(collapse, link) {
      document.getElementById('bt-' + collapse + '-collapse').setAttribute('aria-expanded', 'true')
      document.getElementById(collapse + '-collapse').setAttribute('class', 'show')
      document.getElementById(link).setAttribute('class', 'focus rounded')
   }

   var loc = window.location.href;
   //HIGHLIGHT FILE MAINTENANCE 
   if (/fileMaintenance/.test(loc)) { document.getElementById('fm-link').style.color = '#f1c644' }

   //HIGHLIGHT ACCOUNTS 
   else if (/customers/.test(loc)) { emphasize('accounts', 'customers') }
   else if (/owners/.test(loc)) { emphasize('accounts', 'owners') }
   else if (/shops/.test(loc)) { emphasize('accounts', 'shops') }
   else if (/employees/.test(loc)) { emphasize('accounts', 'employees') }
   else if (/barberApps/.test(loc)) { emphasize('accounts', 'barberApps') }

   //HIGHLIGHT INFORMATION MODULES
   else if (/hairTrends/.test(loc)) { emphasize('information', 'hairTrends') }
   else if (/hairStylingTips/.test(loc)) { emphasize('information', 'hairStylingTips') }
   else if (/haircutPreview/.test(loc)) { emphasize('information', 'haircutPreview') }
}

//FILE MAINTENANCE DISPLAY FUNCTIONS
function displayAdd(id) {
   toggleDisplayAdd(id)
   msnry.layout();
}

function displayEdit(id, value, editValue, icons, editIcons) {
   toggleDisplayEdit(value, icons, editValue, editIcons);
}

//over ride for services
function displayEdit2(value, editValue, value2, editValue2, icons, editIcons) {
   toggleDisplayEdit2(value, value2, icons, editValue, editValue2, editIcons);
}

function toggleDisplayAdd(element) {
   if (element.style.display == 'none') {
      element.style.display = 'block';
   }
   else {
      element.style.display = 'none';
   }
}

function toggleDisplayEdit(value, icons, valueEdit, iconsEdit) {
   if (value.style.display == 'none') {
      value.style.display = 'block';
      icons.style.display = 'block';
      valueEdit.style.display = 'none';
      iconsEdit.style.display = 'none';
   }
   else {
      value.style.display = 'none';
      icons.style.display = 'none';
      valueEdit.style.display = 'block';
      iconsEdit.style.display = 'block';
   }
}

//over ride for services
function toggleDisplayEdit2(value, value2, icons, valueEdit, valueEdit2, iconsEdit) {
   if (value.style.display == 'none' && value2.style.display == 'none') {
      value.style.display = 'block';
      value2.style.display = 'block';
      icons.style.display = 'block';
      valueEdit.style.display = 'none';
      valueEdit2.style.display = 'none';
      iconsEdit.style.display = 'none';
   }
   else {
      value.style.display = 'none';
      value2.style.display = 'none';
      icons.style.display = 'none';
      valueEdit.style.display = 'block';
      valueEdit2.style.display = 'block';
      iconsEdit.style.display = 'block';
   }
}
