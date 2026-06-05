export function createVideoCallBooking() {
    const div = document.createElement("div");
    div.className = "plugin-video-booking";
    div.style.color = "white";
    div.innerHTML = `
        <div style="background:#1b1b1b; padding:20px; border-radius:12px;">
            <h3>📅 Schedule a Paid Video Call</h3>
            <p>Set your availability and pricing for 1-on-1 sessions.</p>
            
            <div style="margin-bottom: 10px;">
                <label>Price per Minute (Credits):</label><br>
                <input id="call-price" type="number" placeholder="e.g., 10" style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 10px;">
                <label>Minimum Duration (Minutes):</label><br>
                <input id="call-min-duration" type="number" placeholder="e.g., 15" style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Set Availability (Hours):</label><br>
                <input id="call-availability" type="text" placeholder="e.g., 6 PM - 10 PM EST" style="width: 100%;">
            </div>
            
            <button id="save-booking-settings" class="button-primary">Save Call Settings</button>
            <button id="view-calendar" class="button-secondary" style="margin-left: 10px;">View My Booking Calendar</button>
        </div>
    `;

    // Handlers for booking management...
    
    return div;
}
