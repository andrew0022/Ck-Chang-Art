import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import Header from './Header';
import './Contact.css'; // Ensure the CSS file is imported

function Contact() {
    const [contactInfo, setContactInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        instagramHandle: '',
        message: '',
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContactInfo({ ...contactInfo, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const EMAILJS_SERVICE_ID = 'service_opwanzq';
        const EMAILJS_TEMPLATE_ID = 'template_szhzccq';
        const EMAILJS_USER_ID = 'ar0bd0xw0spdi7hSC';

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactInfo, EMAILJS_USER_ID)
            .then((response) => {
                console.log('Email sent successfully:', response);
                setShowSuccessModal(true); // Show the success modal
                // Clear the form
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
                // Optionally handle errors (e.g., show an error message)
            });
    };

    const closeModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <div>
            <Header />
            <div id="contact" className="contact-section">
                <form className='contact-form-box' onSubmit={handleSubmit}>
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
            {showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <p>Your message has been received!</p>
                        <button onClick={closeModal} style={{
                            cursor: 'pointer',
                            padding: '10px 20px',
                            fontSize: '16px',
                            color: 'white',
                            backgroundColor: 'black',
                            border: 'none',
                            borderRadius: '5px'
                        }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Contact;
