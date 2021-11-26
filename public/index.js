highlight();

window.onload = function () {
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

//FORMAT DATE
//To format super specific date ang haba haba punyemas
function formatDate() {
   var dateDisplay = document.getElementsByClassName("dateDisplay");
   for (var i = 0; i < dateDisplay.length; i++) {
      dateDisplay[i].innerHTML = dateDisplay[i].innerHTML.substring(4, 15);
   }
}

//FOR CATEGORY AND SERVICES -- for changing services based on the selected category
var service;
function changeServices(b, n, id) {
   const chosenCategory = b.value;
   updateServices(chosenCategory, id);
   service = document.querySelector("#service" + n);
}

function updateServices(category, id) {
   var services = [];
   fetch("/getInfo/services")
      .then((res) => res.json())
      .then((data) => {
         for (var i = 0; i < data.length; i++) {
            if (data[i].CategoryID == category) {
               services.push(data[i]);
            }
         }
      })
      .then((data) => {
         var serviceOptions =
            "<option hidden disabled selected>Service</option>";
         services.forEach((element) => {
            serviceOptions +=
               "<option value=" +
               element.ServicesID +
               "> " +
               element.Name +
               " </option>";
         });
         service.innerHTML = serviceOptions;
      });
}

//FOR APPOINTMENTS -- CATEGORY AND SERVICES
var apptService;
function changeApptServices(b, n, id) {
   const chosenCategory = b.value;
   updateApptServices(chosenCategory, id);
   apptService = document.querySelector("#service" + n);
}

function updateApptServices(category, id) {
   console.log(category, id);
   var services = [];
   fetch("/getInfo/shopservicesview")
      .then((res) => res.json)
      .then((data) => {
         for (var i = 0; i < data.length; i++) {
            if (category == data[i].CategoryID && id == data[i].shopID) {
               services.push(data[i]);
            }
         }
      })
      .then((data) => {
         var serviceOptions =
            "<option hidden disabled selected>Service</option>";
         services.forEach((element) => {
            serviceOptions +=
               "<option value=" +
               element.ID +
               "> " +
               element.Service +
               " </option>";
         });
         apptService.innerHTML = serviceOptions;
      });
}

//FOR EMPLOYEE SPECIALIZATION
function changeEmployee() {
   var el = document
      .getElementById("service2")
      .fetch("/getInfo/employeeSpecialization")
      .then((res) => res.json())
      .then((data) => {
         var ableEmployees = [];
         for (var i = 0; i < data.length; i++) {
            if (data.shopServicesID == el.value) {
               ableEmployees.push(data[i].employeeID);
            }
         }
      });
}

//FOR FLATPICKR -- For changing enabled dates per employee
//get select element that holds the barber list
const attendingEmp = document.querySelector("#attendingEmp");

//Listens to attendingEmp
attendingEmp.onchange = function () {
   const employee = attendingEmp.value;
   updateDatePicker(employee);
};

function updateDatePicker(employee) {
   var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
   ];
   var nonWorkingDays = [];
   var nwdNumberForm = [];
   var scheduleData, appointments, services, shopservices;

   fetch("/getInfo/services")
      .then((res) => res.json())
      .then((data) => {
         services = data;
      });

   fetch("/getInfo/shopservices")
      .then((res) => res.json())
      .then((data) => {
         shopservices = data;
      });

   fetch("/getInfo/appointments")
      .then((res) => res.json())
      .then((data) => {
         appointments = data;
      });

   //get nonworking days
   fetch("/getInfo/schedule")
      .then((res) => res.json())
      .then((data) => {
         scheduleData = data;
         for (var i = 0; i < data.length; i++) {
            if (data[i].EmployeeID == employee && data[i].TimeIn == null) {
               nonWorkingDays.push(data[i].Date);
            }
         }
      })
      //get non working days index for flatpicker
      .then((data) => {
         for (var i = 0; i < nonWorkingDays.length; i++) {
            if (days.includes(nonWorkingDays[i])) {
               nwdNumberForm.push(days.indexOf(nonWorkingDays[i]));
            }
         }
      })
      //initializes datepicker with dynamic disabled days
      .then((data) => {
         const myInput = document.querySelector("#apptDate");
         const fp = flatpickr(myInput, {
            disable: [
               function (date) {
                  return nwdNumberForm.includes(date.getDay());
               },
            ],
            onChange: function (selectedDates, dateStr, instance) {
               //1. get date
               var day = selectedDates[0].getDay();
               //2. get occupied time of chosen date
               var occupiedTimeSlot = [];
               var occupiedTime, occupiedDur, end;

               for (var i = 0; i < appointments.length; i++) {
                  //check if the appt is of the chosen employee
                  if (appointments[i].EmployeeID == employee) {
                     //check if the appt is of the same date
                     var newDate = new Date(appointments[i].Date);
                     var currentDate =
                        newDate.getFullYear() +
                        "-" +
                        (newDate.getMonth() + 1) +
                        "-" +
                        newDate.getDate();
                     if (currentDate == dateStr) {
                        //get time
                        occupiedTime = appointments[i].Time;
                        //get duration
                        shopservices.forEach((element) => {
                           if (
                              appointments[i].ShopServicesID ==
                              element.shopServicesID
                           ) {
                              occupiedDur = element.Duration;
                              end = new Date(dateStr + " " + occupiedTime);
                              var endAAA = new Date(
                                 end.getTime() + occupiedDur * 60000
                              );
                              occupiedTimeSlot.push([
                                 occupiedTime,
                                 endAAA.toTimeString().substring(0, 8),
                              ]);
                           }
                        });
                        console.log(occupiedTimeSlot);
                     }
                  }
               }
               //3. get schedule of chosen date
               //---select timeIn and timeOut from tblsched where empId = employee
               var daySchedTimeIn, daySchedTimeOut;
               for (var i = 0; i < scheduleData.length; i++) {
                  //check that the schedule to be returned is of the chosen employee
                  if (scheduleData[i].EmployeeID == employee) {
                     //chech if the returned sched must be the same as the day
                     var a = scheduleData[i].Date;
                     var dayIndex = days.indexOf(a);
                     if (dayIndex == day) {
                        daySchedTimeIn = scheduleData[i].TimeIn;
                        daySchedTimeOut = scheduleData[i].TimeOut;
                        console.log(daySchedTimeOut + " " + daySchedTimeIn);
                     }
                  }
               }
               //4. get chosen service and duration
               var loc = window.location.href;
               var shopId = loc.charAt(loc.length - 1);
               var serviceId = document.getElementById("service2").value;
               var duration;
               for (var i = 0; i < shopservices.length; i++) {
                  if (
                     shopservices[i].shopID == shopId &&
                     shopservices[i].servicesID == serviceId
                  ) {
                     duration = shopservices[i].Duration;
                  }
               }

               //5. iterate through timeStart and timeOut
               //dummy dates lang yung date kasi ang importante naman is yung time
               var timeEnd = new Date("2015-03-25 " + daySchedTimeOut);
               var iteratingTime = new Date("2015-03-25 " + daySchedTimeIn);
               var timeArrDisplay = [],
                  timeArrValue = [];
               while (iteratingTime < timeEnd) {
                  //nadagdagdan si iterating time ng minutes

                  timeArrValue.push(
                     iteratingTime.toTimeString().substring(0, 8)
                  );
                  timeArrDisplay.push(
                     iteratingTime.toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                     })
                  );
                  iteratingTime = new Date(
                     iteratingTime.getTime() + duration * 60000
                  );
               }

               var timeDropBox = document.getElementById("time");
               var timeOptions =
                  "<option hidden disabled selected>Time</option>";
               for (var i = 0; i < timeArrValue.length; i++) {
                  timeOptions +=
                     "<option value='" +
                     timeArrValue[i] +
                     "'> " +
                     timeArrDisplay[i] +
                     " </option>";
               }
               timeDropBox.innerHTML = timeOptions;

               //select time from tblappts where empID = employeeID and date = dateStr

               //slice free time depending on the service duration
               // for(start timeIn; ++ ){
               //    set timeStart and timeEnd using duration
               //    compare from time array if may masasagasaan syang oras

               // }
            },
         });
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
      }
      // Otherwise, display the correct tab:
      showTab(currentTab);
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
      x[n + 1].className += " active";
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

function toggleDialog(dialog, action, form) {
   var el = document.getElementById(dialog);
   if (el.style.display == "none") {
      // document.getElementById(mainPage).style.filter = "brightness(75%)"
      document.getElementById(dialog).style.display = "block";
      toggleMultiForm(dialog, action, form);
   } else {
      // document.getElementById(mainPage).style.filter = "brightness(100%)"
      document.getElementById(dialog).style.display = "none";
      toggleMultiForm(dialog, action, form);
   }
}

// for date time
var dt = new Date();
document.getElementById("datetime").innerHTML =
   ("0" + (dt.getMonth() + 1)).slice(-2) +
   "/" +
   ("0" + dt.getDate()).slice(-2) +
   "/" +
   dt.getFullYear() +
   " " +
   ("0" + dt.getHours() + 1).slice(-2) +
   ":" +
   ("0" + dt.getMinutes() + 1).slice(-2);

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
   }

   //HIGHLIGHT ACCOUNTS
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

   //HIGHLIGHT INFORMATION MODULES
   else if (/hairTrends/.test(loc)) {
      emphasize("information", "hairTrends");
   } else if (/hairStylingTips/.test(loc)) {
      emphasize("information", "hairStylingTips");
   } else if (/haircutPreview/.test(loc)) {
      emphasize("information", "haircutPreview");
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
