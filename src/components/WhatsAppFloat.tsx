import React from 'react';

const WhatsAppFloat = () => {
  return (
    <a 
      href="https://api.whatsapp.com/send?phone=919176827480&text=Hello!%20I%20need%20help." 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-[1000] transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
        alt="Chat on WhatsApp" 
        width={55} 
        height={55}
        className="drop-shadow-lg"
      />
    </a>
  );
};

export default WhatsAppFloat;
