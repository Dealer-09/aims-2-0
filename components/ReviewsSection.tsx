import React from 'react';

const ReviewsSection: React.FC = () => {
  return (
    <section className="reviews container" id="reviews">
      <h2 className="heading">Reviews</h2>
      <div className="reviews-content swiper">
        <div className="swiper-wrapper">
          <div className="swiper-slide">
            <div className="review-box">
              <i className='bx bxs-quote-right'></i>
              <p className="review-text">Your lessons have left an indelible mark on my life.</p>
              <div className="review-profile">
                <h2>Vikash</h2>
                <span>From Hindmotor</span>
                <img src="/img/vikash.jpg" alt="Vikash" onContextMenu={(e) => e.preventDefault()} />
              </div>
            </div>
          </div>
          <div className="swiper-slide">
            <div className="review-box">
              <i className='bx bxs-quote-right'></i>
              <p className="review-text">Really grateful to have a teacher like this!!</p>
              <div className="review-profile">
                <h2>Divya</h2>
                <span>From Hindmotor</span>
                <img src="/img/divya.jpeg" alt="Divya" onContextMenu={(e) => e.preventDefault()} />
              </div>
            </div>
          </div>
        </div>
        <div className="swiper-pagination"></div>
      </div>
    </section>
  );
};
export default ReviewsSection;
