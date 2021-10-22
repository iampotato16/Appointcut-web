var modal = document.getElementById("modal");
var btn = document.getElementById("btnModalAdd");
var span = document.getElementById("modalClose");
const editButtons = document.getElementsByClassName("editCustomer");
const editCancel = document.getElementById("editCancel");
const modalForm = document.getElementById("modalForm")
const editFields = document.getElementsByClassName("edit-visibility");
const addFields = document.getElementsByClassName("add-visibility");
const addVisibleButtons = document.getElementById("addButtons");
const editVisibleButtons = document.getElementById(`edit-confirm-${table}`);

console.log(table)

function showModal() {
    modal.style.display = "block";
}
function hideModal() {
    modal.style.display = "none";
}

/**
*Displays modal dialog with proper fields displayed in filled
*@param id id of row to be edited
*/
function modalEditMode(id) {
    //row details
    const rowFields = document.getElementsByClassName(`customerInfo-${id}`);
    let rowData = [];



    //redirect form action
    modalForm.action = "/customers/edit";

    //extract field data
    for (i = 0; i < rowFields.length; i++) {
        rowData.push(rowFields[i].textContent);
    }

    //initialize fields with row details, assuming everything is in order
    //textbox
    for (index = 0; index < addCustomerText.length; index++) {
        addCustomerText[index].value = rowData.shift()
    }
    //checkbox
    for (index = 0; index < addCustomerCheck.length; index++) {
        let isChecked = rowData.shift() === "True";
        addCustomerCheck[index].checked = isChecked;
    }

    //configure the displays
    //show edit fields
    for(index =0; index < editFields.length;index++){
        editFields[index].style.display = "flex";

    }
    //hide add fields
    for(index =0; index < addFields.length;index++){
        addFields[index].style.display = "none";
    }
    addVisibleButtons.style.display = "none";
    editVisibleButtons.style.display = "flex";
    showModal();
}

function modalAddMode() {


    //redirect form action
    modalForm.action = "/customers"
    //clear inputs
    for (index = 0; index < editFields.length; index++) {
        if(editFields.type == "text") editFields[index].value = "";
        else if (editFields.type == "checkbox") editFields[index].checked = "false";
    }
    //hide edit fields
    for(index =0; index < editFields.length;index++){
        editFields[index].style.display = "none";

    }
    //show add fields
    for(index =0; index < addFields.length;index++){
        addFields[index].style.display = "flex";
    }
    //hide edit buttons
    editVisibleButtons.style.display = "none";
    //show add buttons
    addVisibleButtons.style.display = "flex";
    //show modal
    showModal();
}

function editRow(ev) {
    let rowID = this.id.split("-")[1]
    //show modal in edit mode
    modalEditMode(rowID);
}



//set onclick listener
//edit buttons of rows
for (let index = 0; index < editButtons.length; index++) {
    let rowID = editButtons[index].id;
    editButtons[index].addEventListener("click", editRow)
}
editCancel.addEventListener("click", hideModal);
//add button
btn.onclick = () => {
    modalAddMode();
}
//close modal button
span.onclick = () => {
    hideModal();
}
//close modal when clicking outside
window.onclick = () => {
    if (event.target == modal) {
        hideModal();
    }
}