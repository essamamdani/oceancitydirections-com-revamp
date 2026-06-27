import Link from "next/link";


const ContactInfo = () => {
  return (
    <>
      <section className='contact-info-area pt-100 pb-70'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-4 col-md-6'>
              <div className='contact-info-box'>
                <div className='back-icon'>
                  <i className='bx bx-map'></i>
                </div>
                <div className='icon'>
                  <i className='bx bx-map'></i>
                </div>
                <h3>Address</h3>
                <p>Realty Directions</p>
                <p>8865 Stanford Blvd</p>
                <p>STE 202 #104</p>
                <p>Columbia, MD 21045</p>

              </div>
            </div>

            <div className='col-lg-4 col-md-6'>
              <div className='contact-info-box'>
                <div className='back-icon'>
                  <i className='bx bx-phone-call'></i>
                </div>
                <div className='icon'>
                  <i className='bx bx-phone-call'></i>
                </div>
                <h3>Contact</h3>
                <p>Realty Directions</p>
                <p>
                  Mobile: <a href='tel:+12405171653'>240-517-1653</a>
                </p>
                <p>
                  E-mail: <a href='mailto:info@baltimoredirections.com'>info@baltimoredirections.com</a>
                </p>
                <p>MD: #654712</p>
                <p>PA: #RMR004680</p>
              </div>
            </div>

            <div className='col-lg-4 col-md-6'>
              <div className='contact-info-box'>
                <div className='back-icon'>
                  <i className='bx bx-time-five'></i>
                </div>
                <div className='icon'>
                  <i className='bx bx-time-five'></i>
                </div>
                <h3>Social</h3>
                <p>
                  <Link href='https://www.facebook.com/joefrenchrealtor'>
                    <i className='bx bxl-facebook'></i> Facebook
                  </Link>
                </p>
                <p><Link href='https://twitter.com/realtydirection'><i className='bx bxl-twitter'></i> Twitter</Link></p>
                <p><Link href='https://www.instagram.com/realtydirections'><i className='bx bxl-instagram'></i> Instagram</Link></p>
                <p><Link href='https://www.videohomes.com/JoeFrenchRealtor'><i className='bx bx-camera-movie'></i> VideoHomes</Link></p>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ContactInfo;