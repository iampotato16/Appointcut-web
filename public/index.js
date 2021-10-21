// for date time
var dt = new Date();
document.getElementById("datetime").innerHTML = (("0" + (dt.getMonth() + 1)).slice(-2)) + "/" + (("0" + dt.getDate()).slice(-2)) + "/" + (dt.getFullYear()) + " " + (("0" + dt.getHours() + 1).slice(-2)) + ":" + (("0" + dt.getMinutes() + 1).slice(-2));

function displayAdd(id) {
   toggleDisplayAdd(id)
   msnry.layout();
}

function displayEdit(id, value, editValue, icons, editIcons) {
   toggleDisplayEdit(value, icons, editValue, editIcons);
}

//over ride for services
function displayEditServices(value, editValue, value2, editValue2, icons, editIcons) {
   toggleDisplayEditServices(value, value2, icons, editValue, editValue2, editIcons);
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
function toggleDisplayEditServices(value, value2, icons, valueEdit, valueEdit2, iconsEdit) {
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
