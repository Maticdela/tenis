// ==========================================
// 1. Calendar Configuration and Initialization
// ==========================================

// Mock availability data (replace with real data from your backend)
let availability = {
    "2024-06-15": ["09:00", "11:00", "14:00"],
    "2024-06-16": ["10:00", "13:00"],
    "2024-06-17": ["09:00", "15:00", "17:00"]
  };
  
  // Initialize FullCalendar after the page loads
  document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
      console.error("Calendar element not found!");
      return;
    }
  
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek"
      },
      events: Object.entries(availability).flatMap(([date, times]) =>
        times.map((time) => ({
          title: "Prosto",
          start: `${date}T${time}:00`,
          color: "#1B5E20",
          allDay: false // Show time-specific events
        }))
      ),
      eventClick: function (info) {
        const date = info.event.startStr.split("T")[0];
        const time = info.event.startStr.split("T")[1].slice(0, 5);
  
        // Set selected date and show time slots
        document.getElementById("selectedDate").value = date;
        showTimeSlots(availability[date]);
  
        // Open booking modal
        document.getElementById("bookingModal").classList.remove("hidden");
      },
      eventDidMount: function (info) {
        const eventTitleEl = info.el.querySelector(".fc-event-title");
        if (eventTitleEl) {
          eventTitleEl.innerHTML = `<span class="font-bold">${info.timeText}</span> - ${info.event.title}`;
        }
      }
    });
  
    calendar.render();
    updateWorkLifeBalance(); // Update work-life balance tracker
  });
  
  // ==========================================
  // 2. Show Available Time Slots
  // ==========================================
  
  function showTimeSlots(times) {
    const container = document.getElementById("timeSlots");
    if (!container) {
      console.error("Time slots container not found!");
      return;
    }
  
    // Generate buttons for each available time slot
    container.innerHTML = times
      .map(
        (time) => `
        <button 
          type="button" 
          onclick="bookTimeSlot('${time}')" 
          class="bg-tennis-green text-white p-2 rounded hover:bg-green-700 transition"
        >
          ${time}
        </button>
      `
      )
      .join("");
  }
  
  // ==========================================
  // 3. Handle Booking
  // ==========================================
  
  function bookTimeSlot(time) {
    const date = document.getElementById("selectedDate").value;
    if (!date || !time) {
      console.error("Date or time not selected!");
      return;
    }
  
    const formData = new FormData();
    formData.append("date", date);
    formData.append("time", time);
  
    // Send booking data to Formspree (replace with your Formspree ID)
    fetch("https://formspree.io/f/your-form-id", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then((response) => {
        if (response.ok) {
          alert("Rezervacija uspešna!");
  
          // Remove the booked time from availability
          availability[date] = availability[date].filter((t) => t !== time);
          closeModal("bookingModal");
          window.location.reload(); // Refresh the calendar
        } else {
          throw new Error("Network response was not ok.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Prišlo je do napake. Prosimo, poskusite znova.");
      });
  }
  
  // ==========================================
  // 4. Modal Functions
  // ==========================================
  
  // Open modal
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
    } else {
      console.error(`Modal with ID ${modalId} not found!`);
    }
  }
  
  // Close modal
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
    } else {
      console.error(`Modal with ID ${modalId} not found!`);
    }
  }
  
  // ==========================================
  // 5. Work-Life Balance Tracker
  // ==========================================
  
  function updateWorkLifeBalance() {
    const workDays = Object.keys(availability).length;
    const recoveryDays = 30 - workDays; // Assuming a 30-day month
  
    const workDaysEl = document.getElementById("workDays");
    const recoveryDaysEl = document.getElementById("recoveryDays");
  
    if (workDaysEl && recoveryDaysEl) {
      workDaysEl.textContent = workDays;
      recoveryDaysEl.textContent = recoveryDays;
    } else {
      console.error("Work-life balance elements not found!");
    }
  }
  
  // ==========================================
  // 6. Automated Reminders (Optional)
  // ==========================================
  
  function sendReminder(date, time, email) {
    if (!date || !time || !email) {
      console.error("Missing date, time, or email for reminder!");
      return;
    }
  
    fetch("/send-reminder", {
      method: "POST",
      body: JSON.stringify({ date, time, email }),
      headers: { "Content-Type": "application/json" }
    })
      .then((response) => {
        if (response.ok) {
          console.log("Reminder sent successfully");
          alert("Opomnik uspešno poslan!");
          closeModal();
          window.location.reload();
          updateWorkLifeBalance();
        } else {
          throw new Error("Failed to send reminder");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }