window.onload = function () {
   highlight();
   formatDate();
   initializeChart("customerVolume");
   setDaterange("daterangeCustomerVolume", -7);
   initializeChart("sales");
   setDaterange("daterangeSales", -7);
};

//SET DATE RANGE
function setDaterange(daterange, num) {
   var currentDate = moment();
   var addDays = moment().add(num, "days");
   var att = document.createAttribute("value");

   if (currentDate > addDays) {
      att.value =
         addDays.format("MM/DD/YYYY") +
         " - " +
         currentDate.format("MM/DD/YYYY"); // Set the value of the class attribute
   } else {
      att.value =
         currentDate.format("MM/DD/YYYY") +
         " - " +
         addDays.format("MM/DD/YYYY"); // Set the value of the class attribute
   }
   document.getElementById(daterange).setAttributeNode(att);
}

//DATA FOR SALARY REPORTS
function setSalaryReport(el) {
   var monthPicker = el.value;
   var chosenMonth = new Date(monthPicker);
   //get employee, salary type, salary value

   var shopID = window.location.href.slice(-2);
   var shopEmployee = [];
   fetch("/getInfo/employee")
      .then((res) => res.json())
      .then((data) => {
         var salaryInfo = [];
         for (var i = 0; i < data.length; i++) {
            if (data[i].ShopID == shopID) {
               shopEmployee.push(data[i]);
            }
         }
         console.log(shopEmployee);
         for (var i = 0; i < shopEmployee.length; i++) {
            //salaryTypeValue
            //1 Commission, 2 Monthy, 3 Hourly
            //Employee, SalaryType, Salary, Amount
            if (shopEmployee[i].salaryTypeID == 2) {
               salaryInfo.push({
                  employee:
                     shopEmployee[i].firstName + " " + shopEmployee[i].lastName,
                  salaryTypeID: shopEmployee[i].salaryTypeID,
                  salaryTypeValue: shopEmployee[i].salaryTypeValue,
                  amount: shopEmployee[i].salaryTypeValue,
               });
            } else if (shopEmployee[i].salaryTypeID == 1) {
               var currentEmployee = shopEmployee[i];
               console.log("HOURLY" + currentEmployee.firstName);
               //retrieve barber schedule
               var sched = [];
               var calendar = new Date(monthPicker);
               var wage = 0;
               fetch("/getInfo/schedule")
                  .then((res) => res.json())
                  .then((data) => {
                     for (var j = 0; j < data.length; j++) {
                        if (data[j].EmployeeID == currentEmployee.EmployeeID) {
                           sched.push(data[j]);
                        }
                     }
                  })
                  .then((data) => {
                     var multiplier = currentEmployee.salaryTypeValue;
                     while (calendar.getMonth() == chosenMonth.getMonth()) {
                        var currentSched;
                        switch (calendar.getDay()) {
                           case 0:
                              currentSched = sched[6];
                              break;
                           case 1:
                              currentSched = sched[0];
                              break;
                           case 2:
                              currentSched = sched[1];
                              break;
                           case 3:
                              currentSched = sched[2];
                              break;
                           case 4:
                              currentSched = sched[3];
                              break;
                           case 5:
                              currentSched = sched[4];
                              break;
                           case 6:
                              currentSched = sched[5];
                              break;
                        }
                        console.log(currentSched);
                        //if null, skip
                        if (currentSched.TimeIn == null) {
                           calendar.setDate(calendar.getDate() + 1);
                           continue;
                        }
                        const hourOut = currentSched.TimeOut.split(":")[0];
                        const hourIn = currentSched.TimeIn.split(":")[0];
                        const minuteOut = currentSched.TimeOut.split(":")[1];
                        const minuteIn = currentSched.TimeIn.split(":")[1];

                        var hoursComputed =
                           parseInt(hourOut) - parseInt(hourIn);
                        const minuteComputed =
                           (60 - parseInt(minuteIn) + parseInt(minuteOut)) / 60;
                        wage += (hoursComputed + minuteComputed) * multiplier;
                        calendar.setDate(calendar.getDate() + 1);
                     }
                     salaryInfo.push({
                        employee:
                           currentEmployee.firstName +
                           " " +
                           currentEmployee.lastName,
                        salaryTypeID: currentEmployee.salaryTypeID,
                        salaryTypeValue: currentEmployee.salaryTypeValue,
                        amount: wage,
                     });
                  });
            }
            /* else {
            aayusin pa values nung mga ==
            } */
         }
         console.log(salaryInfo);
         //set table here
      });
   //
}

//CHARTS FOR REPORTS
function initializeChart(chart) {
   var xStart = moment().add(-7, "days");
   var xEnd = moment();
   var xValues = [];
   while (xStart < xEnd) {
      xValues.push(xStart.format("YYYY-MM-DD"));
      xStart.add(1, "days");
   }
   if (chart == "customerVolume") {
      fetch("/getInfo/appointments")
         .then((res) => {
            return res.json();
         })
         .then((data) => {
            var yValues = [];
            var apptsTotal = 0;
            for (var i = 0; i < xValues.length; i++) {
               for (var j = 0; j < data.length; j++) {
                  var temp = moment(data[j].Date.substring(0, 10));
                  temp.add(1, "days");
                  if (temp.format("YYYY-MM-DD") === xValues[i]) {
                     apptsTotal++;
                  }
               }
               yValues.push(apptsTotal);
               apptsTotal = 0;
            }
            var ctx = document.getElementById("myChart");
            myChart = new Chart(ctx, {
               type: "line",
               data: {
                  labels: xValues,
                  datasets: [
                     {
                        fill: false,
                        lineTension: 0,
                        backgroundColor: "rgba(0,0,255,1.0)",
                        borderColor: "rgba(0,0,255,0.1)",
                        data: yValues,
                     },
                  ],
               },
               options: {
                  legend: { display: true },
                  plugins: {
                     title: {
                        display: true,
                        text: "This is a title",
                     },
                  },
               },
            });
         });
   } else if (chart == "sales") {
      fetch("/getInfo/appointments")
         .then((res) => res.json())
         .then((data) => {
            //compare every element with the date
            //if may appt na tumama ++ sa apptsTotal

            var accumulatedSales = [];
            for (var i = 0; i < xValues.length; i++) {
               var salesTotal = 0;
               for (var j = 0; j < data.length; j++) {
                  var temp = moment(data[j].Date.substring(0, 10));
                  temp.add(1, "days");
                  if (temp.format("YYYY-MM-DD") === xValues[i]) {
                     if (data[j].appStatusID == 2) {
                        salesTotal += data[j].amountDue;
                     }
                  }
               }
               accumulatedSales.push(salesTotal);
            }
            var yValues = accumulatedSales;
            //yValues = numrange;
            var ctx = document.getElementById("chartSales");
            chartSales = new Chart(ctx, {
               type: "line",
               data: {
                  labels: xValues,
                  datasets: [
                     {
                        fill: false,
                        lineTension: 0,
                        backgroundColor: "rgba(0,0,255,1.0)",
                        borderColor: "rgba(0,0,255,0.1)",
                        data: yValues,
                     },
                  ],
               },
               options: {
                  legend: { display: false },
                  scales: {
                     yAxes: [
                        {
                           display: true,
                           ticks: {
                              min: 0,
                           },
                        },
                     ],
                  },
               },
            });
         });
   }
}

//CUSTOMER VOLUME REPORT
//Data needed: dates, accumulated appts for the date
//daterange picker -- triggers chart update based on date range
$(function () {
   $("#daterangeCustomerVolume").daterangepicker(
      {
         opens: "left",
      },
      function (start, end, label) {
         var daterange = [];
         var startDate = moment(start.format("YYYY-MM-DD"));
         var endDate = moment(end.format("YYYY-MM-DD"));
         var dateDiff = endDate.diff(startDate, "days");

         for (var i = 0; i <= dateDiff; i++) {
            daterange.push(startDate.format("YYYY-MM-DD"));
            startDate.add(1, "days");
         }

         fetch("/getInfo/appointments")
            .then((res) => res.json())
            .then((data) => {
               //compare every element with the date
               //if may appt na tumama ++ sa apptsTotal

               var numrange = [];
               var apptsTotal = 0;
               for (var i = 0; i < daterange.length; i++) {
                  for (var j = 0; j < data.length; j++) {
                     var temp = moment(data[j].Date.substring(0, 10));
                     temp.add(1, "days");
                     if (temp.format("YYYY-MM-DD") === daterange[i]) {
                        apptsTotal++;
                     }
                  }
                  numrange.push(apptsTotal);
                  apptsTotal = 0;
               }
               xValues = daterange;
               yValues = numrange;
               var ctx = document.getElementById("myChart");
               var myChart = new Chart(ctx, {
                  type: "line",
                  data: {
                     labels: xValues,
                     datasets: [
                        {
                           fill: false,
                           lineTension: 0,
                           backgroundColor: "rgba(0,0,255,1.0)",
                           borderColor: "rgba(0,0,255,0.1)",
                           data: yValues,
                        },
                     ],
                  },
                  options: {
                     legend: { display: false },
                     scales: {
                        yAxes: [
                           {
                              display: true,
                              ticks: {
                                 //beginAtZero: true, // minimum value will be 0.
                                 min: 0,
                                 stepSize: 1, // 1 - 2 - 3 ...
                              },
                           },
                        ],
                     },
                  },
               });
            });
      }
   );
});

//SALES REPORT
//Data needed: dates, accumulated salary of finished appts for the date
//daterange picker -- triggers chart update based on date range
$(function () {
   $("#daterangeSales").daterangepicker(
      {
         opens: "left",
      },
      function (start, end, label) {
         var daterange = [];
         var startDate = moment(start.format("YYYY-MM-DD"));
         var endDate = moment(end.format("YYYY-MM-DD"));
         var dateDiff = endDate.diff(startDate, "days");

         for (var i = 0; i <= dateDiff; i++) {
            daterange.push(startDate.format("YYYY-MM-DD"));
            startDate.add(1, "days");
         }

         fetch("/getInfo/appointments")
            .then((res) => res.json())
            .then((data) => {
               //compare every element with the date
               //if may appt na tumama ++ sa apptsTotal

               var accumulatedSales = [];
               for (var i = 0; i < daterange.length; i++) {
                  var salesTotal = 0;
                  for (var j = 0; j < data.length; j++) {
                     var temp = moment(data[j].Date.substring(0, 10));
                     temp.add(1, "days");
                     if (temp.format("YYYY-MM-DD") === daterange[i]) {
                        if (data[j].appStatusID == 2) {
                           salesTotal += data[j].amountDue;
                        }
                     }
                  }
                  accumulatedSales.push(salesTotal);
               }
               yValues = accumulatedSales;
               xValues = daterange;
               //yValues = numrange;
               var ctx = document.getElementById("chartSales");
               var chartSales = new Chart(ctx, {
                  type: "line",
                  data: {
                     labels: xValues,
                     datasets: [
                        {
                           fill: false,
                           lineTension: 0,
                           backgroundColor: "rgba(0,0,255,1.0)",
                           borderColor: "rgba(0,0,255,0.1)",
                           data: yValues,
                        },
                     ],
                  },
                  options: {
                     legend: { display: false },
                     scales: {
                        yAxes: [
                           {
                              display: true,
                              ticks: {
                                 min: 0,
                              },
                           },
                        ],
                     },
                  },
               });
            });
      }
   );
});

function toggleMenu(id) {
   $("#manageShop").css({
      "background-color": "",
      color: "",
      "box-shadow": "",
   });
   $("#manageAppts").css({
      "background-color": "",
      color: "",
      "box-shadow": "",
   });
   $("#manageReports").css({
      "background-color": "",
      color: "",
      "box-shadow": "",
   });
   $("#divShop").css("display", "none");
   $("#divAppts").css("display", "none");
   $("#divReports").css("display", "none");
   if (id == "manageShop") {
      $("#divShop").css("display", "block");
      $("#manageShop").css({
         "background-color": "#f1c644",
         color: "black",
         "box-shadow": "none",
      });
   } else if (id == "manageAppts") {
      $("#divAppts").css("display", "block");
      $("#manageAppts").css({
         "background-color": "#f1c644",
         color: "black",
         "box-shadow": "none",
      });
   } else {
      $("#divReports").css("display", "block");
      $("#manageReports").css({
         "background-color": "#f1c644",
         color: "black",
         "box-shadow": "none",
      });
   }
}

//FORMAT DATE
//To format super specific date ang haba haba punyemas
function formatDate() {
   var dateDisplay = document.getElementsByClassName("dateDisplay");
   for (var i = 0; i < dateDisplay.length; i++) {
      dateDisplay[i].innerHTML = dateDisplay[i].innerHTML.substring(4, 15);
   }
}

//FOR CITY AND BARANGAY
var barangay;
function changeBrgy(el, n) {
   const city = el.value;
   updateBarangay(city);
   barangay = document.getElementById("barangay" + n);
}

function updateBarangay(city) {
   var barangayList = [];
   fetch("/getInfo/barangay")
      .then((res) => res.json())
      .then((data) => {
         for (var i = 0; i < data.length; i++) {
            if (data[i].CityID == city) {
               barangayList.push(data[i]);
            }
         }
      })
      .then((data) => {
         var brgyOptions = "<option hidden disabled selected>Barangay</option>";
         barangayList.forEach((element) => {
            brgyOptions +=
               "<option value=" +
               element.BarangayID +
               "> " +
               element.Name +
               " </option>";
         });
         console.log(barangay);
         barangay.innerHTML = brgyOptions;
      });
}

// FOR MULTIFORMS
function toggleMultiForm(dialog, action, form) {
   //HIDE ALL FORMS
   //REMOVE VALIDATION
   var x = document.getElementsByClassName("tab " + action);
   for (var i = 0; i < x.length; i++) {
      x[i].style.display = "none";
      unvalidateForm();
   }

   function unvalidateForm() {
      // This function deals with validation of the form fields
      var y,
         z,
         a,
         valid = true;
      y = x[i].querySelectorAll("input[type=text]");
      a = x[i].querySelectorAll("input[type=checkbox]");

      // A loop that checks every input field in the current tab:
      if (action == "addEmp") {
         for (z = 0; z < y.length; z++) {
            y[z].classList.remove("bg-warning");
            y[z].value = "";
            // and set the current valid status to false:
            valid = false;
         }
         for (z = 0; z < a.length; z++) {
            a[z].checked = false;
         }
      }

      //Removes all 'finish' classes
      var step = document.getElementsByClassName("step " + action);
      for (var g = 0; i < step.length; i++) {
         step[g].classList.remove("finish");
         //bakit kelangan ng return true?? Kasi nagrereturn ata sya ng false pag di nya nagagawa yung line of code above
         //this means na wala syang mahanap na finish class
         //also di kasi naeexecute yung pag hide at pag unvalidate ng forms pag wala to. aaaa
         return true;
      }
   }

   var currentTab = 0; // Current tab is set to be the first tab (0)
   showTab(currentTab); // Display the current tab
   function showTab(n) {
      // This function will display the specified tab of the form ...
      x[n].style.display = "block";
      // ... and fix the Previous/Next buttons:
      if (n == 0) {
         document.getElementById("prevBtn" + action).style.display = "none";
      } else {
         document.getElementById("prevBtn" + action).style.display = "inline";
      }
      if (n == x.length - 1) {
         document.getElementById("nextBtn" + action).innerHTML = "Submit";
      } else {
         document.getElementById("nextBtn" + action).innerHTML = "Next";
      }
      // ... and run a function that displays the correct step indicator:
      fixStepIndicator(n);
   }

   function nextPrev(n) {
      // This function will figure out which tab to display
      var x = document.getElementsByClassName("tab " + action);
      console.log(n, validateForm());
      // Exit the function if any field in the current tab is invalid:
      if (n == 1 && !validateForm()) return false;
      // Hide the current tab:
      x[currentTab].style.display = "none";
      // Increase or decrease the current tab by 1:
      currentTab = currentTab + n;
      // if you have reached the end of the form... :
      if (currentTab >= x.length) {
         //...the form gets submitted:
         document.getElementById(form).submit();
         toggleDialog(dialog);
         return false;
      } else {
         showTab(currentTab);
      }
      // Otherwise, display the correct tab:
   }
   toggleMultiForm.nextPrev = nextPrev;

   function validateForm() {
      // This function deals with validation of the form fields
      var x,
         y,
         i,
         valid = true;
      x = document.getElementsByClassName("tab " + action);
      y = x[currentTab].querySelectorAll("input[type=text]");
      // A loop that checks every input field in the current tab:
      for (i = 0; i < y.length; i++) {
         // If a field is empty...
         if (y[i].value == "") {
            // add an "invalid" class to the field:
            y[i].className += " bg-warning";
            // and set the current valid status to false:
            valid = false;
         }
      }
      // If the valid status is true, mark the step as finished and valid:
      if (valid) {
         document.getElementsByClassName("step " + action)[
            currentTab
         ].className += " finish";
      }
      return valid; // return the valid status
   }

   function fixStepIndicator(n) {
      // This function removes the "active" class of all steps...
      var i,
         x = document.getElementsByClassName("step " + action);
      for (i = 0; i < x.length; i++) {
         x[i].className = x[i].className.replace(" active", "");
      }
      //... and adds the "active" class to the current step:
      console.log(x[n] + "pleaaaaaaaaase");
      x[n].className += " active";
   }
}

//FOR DISABLING UNCHECKED DAYS IN SCHEDULE
const checkDays = document.querySelectorAll('*[id^="checkDays"]');
const timeIn = document.querySelectorAll('*[id^="timeIn"]');
const timeOut = document.querySelectorAll('*[id^="timeOut"]');

checkDays.forEach((element, index) => {
   element.onchange = function () {
      console.log(index);
      timeIn[index].removeAttribute("disabled");
      timeOut[index].removeAttribute("disabled");
   };
});

function enableTime() {
   for (var i = 0; i, checkDays.length; i++) {
      if (!checkDays.checked) {
         console.log(checkDays);
         timeIn[i].disabled = true;
         timeOut[i].disabled = true;
      }
   }
}

function toggleMultiDialog(dialog, action, form) {
   var el = document.getElementById(dialog);
   if (el.style.display == "none") {
      document.getElementById(dialog).style.display = "block";
      toggleMultiForm(dialog, action, form);
   } else {
      document.getElementById(dialog).style.display = "none";
      toggleMultiForm(dialog, action, form);
   }
}

function toggleDialog(dialog) {
   var el = document.getElementById(dialog);
   if (el.style.display == "none") {
      document.getElementById(dialog).style.display = "block";
   } else {
      document.getElementById(dialog).style.display = "none";
   }
}
// for date time
var dt = new Date();
document.getElementById("datetime").innerHTML = dt.toLocaleString();

//HIGHLIGHT FILE MAINTENANCE IN SIDEBAR
function highlight() {
   function emphasize(collapse, link) {
      document
         .getElementById("bt-" + collapse + "-collapse")
         .setAttribute("aria-expanded", "true");
      document
         .getElementById(collapse + "-collapse")
         .setAttribute("class", "show");
      document.getElementById(link).setAttribute("class", "focus rounded");
   }

   var loc = window.location.href;
   //HIGHLIGHT FILE MAINTENANCE
   if (/fileMaintenance/.test(loc)) {
      document.getElementById("fm-link").style.color = "#f1c644";

      //HIGHLIGHT DESK PAGES
   } else if (/deskAccount/.test(loc)) {
      if (/employees/.test(loc)) {
         emphasize("shops", "deskEmployees");
      } else if (/deskAccount/.test(loc) && /services/.test(loc)) {
         emphasize("shops", "deskServices");
      } else if (/deskAccount/.test(loc) && /schedule/.test(loc)) {
         emphasize("shops", "deskSchedule");
      } else if (/deskAccount/.test(loc) && /appointments/.test(loc)) {
         emphasize("appointments", "deskAppointments");
      } else if (/deskAccount/.test(loc) && /appointmentHistory/.test(loc)) {
         emphasize("appointments", "deskAppointmentHistory");
      } else {
         document.getElementById("deskReports").style.color = "#f1c644";
      }
   }

   //HIGHLIGHT ADMIN PAGES
   else if (/customers/.test(loc)) {
      emphasize("accounts", "customers");
   } else if (/owners/.test(loc)) {
      emphasize("accounts", "owners");
   } else if (/shops/.test(loc)) {
      emphasize("accounts", "shops");
   } else if (/employees/.test(loc)) {
      emphasize("accounts", "employees");
   } else if (/barberApps/.test(loc)) {
      emphasize("accounts", "barberApps");
   }
}

//FILE MAINTENANCE DISPLAY FUNCTIONS
function displayAdd(id) {
   toggleDisplayAdd(id);
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
   if (element.style.display == "none") {
      element.style.display = "block";
   } else {
      element.style.display = "none";
   }
}

function toggleDisplayEdit(value, icons, valueEdit, iconsEdit) {
   if (value.style.display == "none") {
      value.style.display = "block";
      icons.style.display = "block";
      valueEdit.style.display = "none";
      iconsEdit.style.display = "none";
   } else {
      value.style.display = "none";
      icons.style.display = "none";
      valueEdit.style.display = "block";
      iconsEdit.style.display = "block";
   }
}

//over ride for services
function toggleDisplayEdit2(
   value,
   value2,
   icons,
   valueEdit,
   valueEdit2,
   iconsEdit
) {
   if (value.style.display == "none" && value2.style.display == "none") {
      value.style.display = "block";
      value2.style.display = "block";
      icons.style.display = "block";
      valueEdit.style.display = "none";
      valueEdit2.style.display = "none";
      iconsEdit.style.display = "none";
   } else {
      value.style.display = "none";
      value2.style.display = "none";
      icons.style.display = "none";
      valueEdit.style.display = "block";
      valueEdit2.style.display = "block";
      iconsEdit.style.display = "block";
   }
}
