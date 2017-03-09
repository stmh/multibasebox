import $ from 'jquery'
import Responsive, {RESKEYS} from '../utils/Responsive'
import TweenLite from 'gsap/TweenLite'
import 'gsap/CSSPlugin'

const $slider = $('[data-circle-slider]')

const setActive = (currentSlide) => {
  $slider.find(`[data-slick-index]`).each((index, el) => {
    if( $(el).data('slick-index') < currentSlide) {
      $(el).addClass('move-left')
    } else if ($(el).data('slick-index') > currentSlide) {
      $(el).addClass('move-right')
    } else {
      $(el).addClass('active-circle')
    }
  })
  $('[data-circle-details]').html($slider.find('.slick-center .details__text').html()).animate({opacity: 1}, 300)
}

$slider.slick({
  prevArrow: $slider.parent().find('[data-swipe-prev]'),
  nextArrow: $slider.parent().find('[data-swipe-next]'),
  responsive: [
      {
        breakpoint: Responsive.BREAKPOINTS[RESKEYS.md],
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: Responsive.BREAKPOINTS[RESKEYS.sm],
        settings: {
          slidesToShow: 1
        }
      }
    ]
})
$slider.on('beforeChange', (event, slick, currentSlide, nextSlide) => {
  $slider.find('.slide').removeClass('active-circle move-left move-right')
  // setTimeout(()=> {
//   $slider.find('.slide').removeClass('active-circle move-left move-right')
//   setActive(nextSlide)
//   }, 1000)
//   $('[data-circle-details]').animate({opacity: 0}, 300)
})
$slider.on('afterChange', (event, slick, currentSlide) => {
  // setActive(currentSlide)
  setTimeout(() => {
    setActive(currentSlide)
  },0)
})
$slider.on('setPosition', (event, slick) => {
  console.log(event);
  
  $('[data-circle-details]').animate({opacity: 0}, 300)
})
setActive(0)