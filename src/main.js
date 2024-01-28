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
const url = `https://pixabay.com/api/?`;
axios.defaults.baseURL = url;
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
const searchParams = new URLSearchParams(paramsRequest);

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
}
const lightbox = new SimpleLightbox('.gallery-list a', simplelightboxOptions);

form.addEventListener('submit', handleSubmit);
btnMore.addEventListener('click', handleMore);
function handleMore(e) {
  getData();
}
function handleSubmit(e) {
  e.preventDefault();
  //reset page
  searchParams.set('page', 1);
  totalPages = 0;
  loader.style.display = 'flex';
  galleryList.innerHTML = '';
  searchParams.set('q', e.target.elements.search.value);
  getData();
  this.reset();
}
async function getData() {
  try {
    const images = await fetchImages();
        // Check if search return any image
        images.totalHits > 0
        ? renderImages(images)
        : iziToast.error(iziToastOptions);
      loader.style.display = 'none';
    // In our case total number of pages is calculated on frontend
    if (totalPages === 0) {
      totalPages = Math.ceil(
        images.totalHits / searchParams.get('per_page'));
       totalPages > 1 ? btnMore.style.display = 'block' :  btnMore.style.display = 'none';;
    }
    // Check the end of the collection to display an alert
    if (searchParams.get('page') > totalPages) {
      btnMore.style.display = 'none';
      return iziToast.error(noMorePages);
    }
    // Increase the group number
    let currentPage = Number(searchParams.get('page'));
    searchParams.set('page', (currentPage += 1));
  } catch (error) {
    console.log(error);
  }
}

async function fetchImages() {
  const response = await axios.get(url + searchParams);
  console.log(url + searchParams);
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
}
