import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.form-search');
const btnMore = document.querySelector('.btn-more');
const galleryList = document.querySelector('.gallery-list');
const loader = document.querySelector('.loader-wrapper');
const API_KEY = '42027651-7bedd500762feb24dffc0a2de';
axios.defaults.baseURL = 'https://pixabay.com/api/';
/* params */
const paramsRequest = {
  key: API_KEY,
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
  page: 1,
};
let totalPages = 0;
/* const searchParams = new URLSearchParams(paramsRequest); */

const simplelightboxOptions = {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
};
const iziToastOptions = {
  theme: 'dark',
  class: 'izi-toast-error-style',
  title: 'Error',
  message:
    'Sorry, there are no images matching your search query. Please try again!',
  backgroundColor: '#EF4040',
  iconUrl: './img/octagon.svg',
  position: 'topRight',
  maxWidth: '25%',
};
const noMorePages = {
  position: 'topRight',
  message: "We're sorry, there are no more posts to load",
};
const lightbox = new SimpleLightbox('.gallery-list a', simplelightboxOptions);

form.addEventListener('submit', handleSubmit);
btnMore.addEventListener('click', handleGetMorePages);

function handleGetMorePages() {
  loaderOffOn('flex');
  btnMoreDisable();
  getData();
  scrollBehavior(loader.getBoundingClientRect().height);
}
function handleSubmit(e) {
  e.preventDefault();
  resetPages();
  loaderOffOn('flex');
  galleryList.innerHTML = '';
  paramsRequest.q = e.target.elements.search.value;
  e.target.elements.perPage.value !== "" ? paramsRequest.per_page = e.target.elements.perPage.value : paramsRequest.per_page = 40;
  getData();
  this.reset();
}
function scrollBehavior(height) {
  scrollBy({
    top: height,
    behavior: 'smooth',
  });
}
function resetPages() {
  totalPages = 0;
  paramsRequest.page =  1;
}
function getTotalPages(images) {
  totalPages = Math.ceil(images.totalHits / paramsRequest.per_page);
}
function btnMoreDisable(){
  totalPages > 1
  ? (btnMore.style.display = 'block')
  : (btnMore.style.display = 'none');
  if (paramsRequest.page >= totalPages && totalPages !== 0) {
    btnMore.style.display = 'none';
    return iziToast.error(noMorePages);
  }
}
function loaderOffOn(display) {
  loader.style.display = display;
}
// get data from server
async function getData() {
  try {
    const images = await fetchImages();
    totalPages === 0 ? getTotalPages(images) : console.log('getTotalPages not run');
    btnMoreDisable();
    // Check if search return any image
    images.totalHits > 0
      ? renderImages(images)
      : iziToast.error(iziToastOptions);
      loaderOffOn('none');
    // Check the end of the collection to display an alert

    // Increase the group number
    paramsRequest.page++;
  } catch (error) {
    console.log(error);
  }
}

async function fetchImages() {
  const response = await axios.get('', { params: paramsRequest });
  return response.data;
}

const markup = images => {
  return images
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<li class="gallery-item">
        <a class="gallery-link" href="${largeImageURL}">
          <img class="gallery-image" src="${webformatURL}" alt="${tags}" width="360" height="200" loading="lazy"/>
        </a>
        <div class="item-info">
        <p class="item-info-p">Likes <span>${likes}</span></p>
        <p class="item-info-p">Views <span>${views}</span></p>
        <p class="item-info-p">Comments <span>${comments}</span></p>
        <p class="item-info-p">Downloads <span>${downloads}</span></p>
        </div>
        </li>`;
      }
    )
    .join('');
};

function renderImages(images) {
  galleryList.insertAdjacentHTML('beforeend', markup(images.hits));
  lightbox.refresh();
  scrollBehavior(galleryList.childNodes[0].getBoundingClientRect().height * 2);
}
