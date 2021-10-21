var modal = document.getElementById("modal");
var btn = document.getElementById("btnAddShop");
var span = document.getElementById("modalClose");
const editButtons = document.getElementsByClassName("edtAddShop");
const editCancel = document.getElementById("editCancel");



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
    const rowFields = document.getElementsByClassName(`shopInfo-${id}`);
    let rowData = [];
    //the fields
    const addShopText = document.getElementsByClassName("addShopText");
    const addShopCheck = document.getElementsByClassName("addShopCheck");

    const idDisplay = document.getElementById("idDisplay");
    const addButtons = document.getElementById("addButtons");
    const editButtons = document.getElementById("editButtons");
    const modalForm = document.getElementById("modalForm");


    //redirect form action
    modalForm.action = "/shops/edit";

    //extract field data
    for (i = 0; i < rowFields.length; i++) {
        rowData.push(rowFields[i].textContent);
    }

    //initialize fields with row details, assuming everything is in order
    //textbox
    for (index = 0; index < addShopText.length; index++) {
        addShopText[index].value = rowData.shift()
    }
    //checkbox
    for (index = 0; index < addShopCheck.length; index++) {
        let isChecked = rowData.shift() === "True";
        addShopCheck[index].checked = isChecked;
    }

    //configure the displays
    idDisplay.style.display = "flex";
    addButtons.style.display = "none";
    editButtons.style.display = "flex";
    showModal();
}

function modalAddMode() {
    const modalForm = document.getElementById("modalForm")
    const addShopText = document.getElementsByClassName("addShopText")
    const addShopCheck = document.getElementsByClassName("addShopCheck")
    const idDisplay = document.getElementById("idDisplay");
    const editButtons = document.getElementById("editButtons");
    const addButtons = document.getElementById("addButtons");


    //redirect form action
    modalForm.action = "/shops"
    //clear inputs
    for (index = 0; index < addShopText.length; index++) {
        addShopText[index].value = "";
    }
    for (index = 0; index < addShopCheck.length; index++) {
        addShopCheck[index].checked = false;
    }
    //hide id display
    idDisplay.style.display = "none";
    //hide edit buttons
    editButtons.style.display = "none";
    //show add buttons
    addButtons.style.display = "flex";
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