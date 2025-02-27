import React from "react";
import { Swiper, SwiperSlide } from "swiper/react"; // ✅ Import Swiper components
import "swiper/css"; // ✅ Import Swiper styles
import "swiper/css/pagination"; // ✅ Import pagination styles
import { Pagination } from "swiper/modules"; // ✅ Import Swiper modules

const ReviewsSection: React.FC = () => {
  return (
    <section className="reviews container" id="reviews">
      <h2 className="heading">Reviews</h2>

      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        pagination={{ clickable: true }} // ✅ Enable pagination dots
        modules={[Pagination]} // ✅ Add Swiper pagination module
        className="reviews-content"
      >
        {/* Review 1 */}
        <SwiperSlide>
          <div className="review-box">
            <i className="bx bxs-quote-right"></i>
            <p className="review-text">Your lessons have left an indelible mark on my life.</p>
            <div className="review-profile">
              <h2>Vikash</h2>
              <span>From Hindmotor</span>
              <img src="/img/vikash.jpg" alt="Vikash" onContextMenu={(e) => e.preventDefault()} />
            </div>
          </div>
        </SwiperSlide>

        {/* Review 2 */}
        <SwiperSlide>
          <div className="review-box">
            <i className="bx bxs-quote-right"></i>
            <p className="review-text">Really grateful to have a teacher like this!!</p>
            <div className="review-profile">
              <h2>Divya</h2>
              <span>From Hindmotor</span>
              <img src="/img/divya.jpeg" alt="Divya" onContextMenu={(e) => e.preventDefault()} />
            </div>
          </div>
        </SwiperSlide>

        {/* Review 3 */}
        <SwiperSlide>
          <div className="review-box">
            <i className="bx bxs-quote-right"></i>
            <p className="review-text">You believed in me when I didn't.</p>
            <div className="review-profile">
              <h2>Tanush</h2>
              <span>From Hindmotor</span>
              <img src="/img/tanush.jpg" alt="Tanush" onContextMenu={(e) => e.preventDefault()} />
            </div>
          </div>
        </SwiperSlide>

        {/* Review 4 */}
        <SwiperSlide>
          <div className="review-box">
            <i className="bx bxs-quote-right"></i>
            <p className="review-text">"You write and speak in a clear and concise manner."</p>
            <div className="review-profile">
              <h2>Srishti</h2>
              <span>From Hindmotor</span>
              <img src="/img/srishti.jpeg" alt="Srishti" onContextMenu={(e) => e.preventDefault()} />
            </div>
          </div>
        </SwiperSlide>

        {/* Review 5 */}
        <SwiperSlide>
          <div className="review-box">
            <i className="bx bxs-quote-right"></i>
            <p className="review-text">"The way you hold all students to a high standard is impressive."</p>
            <div className="review-profile">
              <h2>Anmol</h2>
              <span>From Bally</span>
              <img src="/img/anmol.jpeg" alt="Anmol" onContextMenu={(e) => e.preventDefault()} />
            </div>
          </div>
        </SwiperSlide>
        {/* Add More Reviews Here If Needed */}
      </Swiper>
    </section>
  );
};

export default ReviewsSection;
