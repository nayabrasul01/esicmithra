import React, { useEffect, useState } from 'react';

const Footer = () => {
const [visitorCount, setVisitorCount] = useState(0);
const hasVisited = sessionStorage.getItem('hasVisited');

//   useEffect(() => {
//     (async () => {
//       try {
//         if(!hasVisited){
//           sessionStorage.setItem('hasVisited', 'true');
//           const count = await authAPI.incrementAndGetVisitorCount();
//           setVisitorCount(count);
//         }else {
//           // Already visited in this session → just fetch
//           const count = await authAPI.visitorCount();
//           setVisitorCount(count);
//         }
//       } catch (err) {
//         // console.error(err.message);
//         showToast("Something went wrong. Visitor count not loaded.", "danger");
//         // toast({
//         //   title: "Error",
//         //   description: "Something went wrong. Visitor count not loaded.",
//         //   variant: "destructive",
//         // });
//       }
//     })();
//   }, []);
  return (
    <div
      className="footer-area-bottom"
      style={{
        background: '#5C100E',
        color: 'white',
        padding: '10px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap', // allow wrap on small screens
        borderTop: '1px solid black'
      }}
    >
      {/* Left Section */}
      <div className="copyright">
        {/* <input
          type="hidden"
          name="hdncount"
          id="hdncount"
          value={visitorCount}
        /> */}
        © <span></span>{' '}
        <strong>
          <span>ESIC 2025</span>
        </strong>
        . <span>All Rights Reserved</span>
      </div>

      {/* Right Section */}
      <div className="copyright4" style={{ textAlign: 'right' }}>
        <span id="lblsitemaintained">
          Site maintained by: ESIC. 
          {/* | Visitors Count: {visitorCount} */}
        </span>
      </div>
    </div>
  );
};

export default Footer;