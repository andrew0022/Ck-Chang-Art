import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import Header from './Header';
import './Contact.css'; // Make sure the CSS file is imported

function Contact() {
    const [contactInfo, setContactInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        instagramHandle: '',
        message: '',
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContactInfo({ ...contactInfo, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const EMAILJS_SERVICE_ID = '';
        const EMAILJS_TEMPLATE_ID = '';
        const EMAILJS_USER_ID = '';

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactInfo, EMAILJS_USER_ID)
            .then((response) => {
                console.log('Email sent successfully:', response);
                // Handle success (e.g., show a success message and clear the form)
                setContactInfo({
                    firstName: '',
                    lastName: '',
                    email: '',
                    instagramHandle: '',
                    message: '',
                });
            })
            .catch((error) => {
                console.error('Email sending failed:', error);
                // Handle error (e.g., show an error message)
            });
    };

    return (
        <div>
            <Header /> 
            <div id="contact" className="contact-section">
                <h2 className= 'contact-title'>Contact Me</h2>
                <form className = 'contact-form-box' onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="firstName"
                        value={contactInfo.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        required
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={contactInfo.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={contactInfo.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="text"
                        name="instagramHandle"
                        value={contactInfo.instagramHandle}
                        onChange={handleInputChange}
                        placeholder="Instagram Handle"
                    />
                    <textarea
                        name="message"
                        value={contactInfo.message}
                        onChange={handleInputChange}
                        placeholder="Your Message"
                        required
                    ></textarea>
                    <button type="submit">Send Message</button>
                </form>
            </div>
        </div>
    );
}

export default Contact;
