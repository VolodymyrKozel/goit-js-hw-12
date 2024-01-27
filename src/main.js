import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.form-search');
const galleryList = document.querySelector('.gallery-list');
const loader = document.querySelector('.loader-wrapper');
const API_KEY = '42027651-7bedd500762feb24dffc0a2de';
const url = `https://pixabay.com/api/?`;
const searchParams = new URLSearchParams({
  key: API_KEY,
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
  page: 1,
});

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
const lightbox = new SimpleLightbox('.gallery-list a', simplelightboxOptions);

form.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  loader.style.display = 'flex';
  galleryList.innerHTML = '';
  searchParams.set('q', e.target.elements.search.value);
  fetchImages()
    .then(images => {
      images.totalHits > 0
        ? renderImages(images)
        : iziToast.error(iziToastOptions);
      loader.style.display = 'none';
    })
    .catch(error => console.log(error));
  form.reset();
}

function fetchImages() {
  return fetch(url + searchParams).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
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
