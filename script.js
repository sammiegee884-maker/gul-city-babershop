function sendToWhatsApp(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const message =
        "Hello Gulu City Barbershop!%0A%0A" +
        "I would like to book an appointment.%0A%0A" +
        "Name: " + name + "%0A" +
        "Phone: " + phone + "%0A" +
        "Service: " + service + "%0A" +
        "Date: " + date + "%0A" +
        "Time: " + time;

    const whatsappNumber = "256787597444";

    window.open(
        "https://wa.me/" + whatsappNumber + "?text=" + message,
        "_blank"
    );
}