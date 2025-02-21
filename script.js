// ==========================================
// 1. Calendar Configuration and Initialization
// ==========================================

// Mock availability data (replace with real data from your backend)
let availability = {
  "2024-06-15": ["09:00", "11:00", "14:00"],
  "2024-06-16": ["10:00", "13:00"],
  "2024-06-17": ["09:00", "15:00", "17:00"]
};

// Run script only after the page loads
document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");
  if (!calendarEl) {
      console.error("Calendar element not found!");
      return;
  }

  var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek"
      },
      events: Object.entries(availability).flatMap(function ([date, times]) {
          return times.map(function (time) {
              return {
                  title: "Prosto",
                  start: date + "T" + time + ":00",
                  color: "#1B5E20",
                  allDay: false // Show time-specific events
              };
          });
      }),
      eventClick: function (info) {
          var parts = info.event.startStr.split("T");
          var date = parts[0];
          var time = parts[1].slice(0, 5);

          var selectedDateEl = document.getElementById("selectedDate");
          if (selectedDateEl) {
              selectedDateEl.value = date;
          }

          showTimeSlots(availability[date]);

          var bookingModal = document.getElementById("bookingModal");
          if (bookingModal) {
              bookingModal.classList.remove("hidden");
          }
      },
      eventDidMount: function (info) {
          var titleEl = info.el.querySelector(".fc-event-title");
          if (titleEl) {
              titleEl.innerHTML = '<span class="font-bold">' + info.timeText + "</span> - " + info.event.title;
          }
      }
  });

  calendar.render();
  updateWorkLifeBalance();
});

// ==========================================
// 2. Show Available Time Slots
// ==========================================

function showTimeSlots(times) {
  var container = document.getElementById("timeSlots");
  if (container) {
      container.innerHTML = times
          .map(function (time) {
              return (
                  '<button type="button" onclick="bookTimeSlot(\'' +
                  time +
                  '\')" class="bg-tennis-green text-white p-2 rounded hover:bg-green-700 transition">' +
                  time +
                  "</button>"
              );
          })
          .join("");
  }
}

// ==========================================
// 3. Handle Booking
// ==========================================

function bookTimeSlot(time) {
  var selectedDateEl = document.getElementById("selectedDate");
  if (!selectedDateEl) return;
  var date = selectedDateEl.value;
  var formData = new FormData();
  formData.append("date", date);
  formData.append("time", time);

  // Send booking data to Formspree (replace with your Formspree ID)
  fetch("https://formspree.io/f/your-form-id", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
  })
      .then(function (response) {
          if (response.ok) {
              alert("Rezervacija uspešna!");
              // Remove the booked time from availability
              if (availability[date]) {
                  availability[date] = availability[date].filter(function (t) {
                      return t !== time;
                  });
              }
              closeModal("bookingModal");
              window.location.reload(); // Refresh the calendar
          }
      })
      .catch(function (error) {
          console.error("Error:", error);
          alert("Prišlo je do napake. Prosimo, poskusite znova.");
      });
}

// ==========================================
// 4. Modal Functions
// ==========================================

// Open modal
function openModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
      modal.classList.remove("hidden");
  }
}

// Close modal
function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
      modal.classList.add("hidden");
  }
}

// ==========================================
// 5. Work-Life Balance Tracker
// ==========================================

function updateWorkLifeBalance() {
  var workDays = Object.keys(availability).length;
  var recoveryDays = 30 - workDays; // Assuming a 30-day month

  var workDaysEl = document.getElementById("workDays");
  var recoveryDaysEl = document.getElementById("recoveryDays");

  if (workDaysEl) {
      workDaysEl.textContent = workDays;
  }
  if (recoveryDaysEl) {
      recoveryDaysEl.textContent = recoveryDays;
  }
}

// ==========================================
// 6. Automated Reminders (Optional)
// ==========================================

function sendReminder(date, time, email) {
  fetch("/send-reminder", {
      method: "POST",
      body: JSON.stringify({ date: date, time: time, email: email }),
      headers: { "Content-Type": "application/json" }
  })
      .then(function (response) {
          if (response.ok) {
              console.log("Reminder sent successfully");
              alert("Opomnik uspešno poslan!");
              closeModal();
              window.location.reload();
              updateWorkLifeBalance();
          } else {
              console.error("Failed to send reminder");
          }
      })
      .catch(function (error) {
          console.error("Error:", error);
      });
}
