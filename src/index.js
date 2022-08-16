import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
const axios = require('axios');

const MY_API_KEY = '29316623-92edd9c1ab4b9b90828fcb6e0';
let pageforBtn = 1;
let valueInput = '';
let totalHitsValue = '';


const input = document.querySelector('input');
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');


const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    close: false,
});

form.addEventListener('submit', onSubmit);

loadMore.addEventListener('click', onClick);

function onSubmit(e) {
    e.preventDefault();
    gallery.innerHTML = '';
    valueInput = e.currentTarget.elements.searchQuery.value.trim();
    if (valueInput === '') {
        Notiflix.Notify.failure('Please enter a search query!');
    } else {
        pageforBtn = 1;

        getUser(valueInput).then(() => {
            if (totalHitsValue > 0) {
                Notiflix.Notify.success(`Hooray! We found ${totalHitsValue} images.`);
            }
            pageforBtn += 1;
            lightbox.refresh();
            input.value = '';
        });
    }
}

async function getUser(q) {
    try {
        const response = await axios.get(
            `https://pixabay.com/api/?key=${MY_API_KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageforBtn}`
        );
        if (response.data.hits.length === 0) {
            Notiflix.Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.'
            );
        }
        let arr = response.data.hits;
        let lastPage = Math.ceil(response.data.totalHits / 40);
        totalHitsValue = response.data.totalHits;

        makeListCountries(arr);

        if (response.data.total > 40) {
            loadMore.classList.remove('visually-hidden');
        }
        if (pageforBtn === lastPage) {
            if (!loadMore.classList.contains('visually-hidden')) {
                loadMore.classList.add('visually-hidden');
            }
            // if (response.data.total <= 40) {
            //     return;
            // }
            Notiflix.Notify.info(
                "We're sorry, but you've reached the end of search results."
            );
        }
    } catch (error) {
        console.error(error);
    }
}

function makeListCountries(data) {
    const markup = makeHtmlListCard(data);
    gallery.insertAdjacentHTML('beforeend', markup);
}

function makeHtmlListCard(data) {
    return data.map(
        ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
            `<div class="photo-card">
  <a href="${largeImageURL}"> 
  <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
  </a>
  <div class="info">
    <p class="info_item">
       <b class="text">Likes ${likes}</b>
    </p>
    <p class="info_item">
         <b class="text">Views ${views}</b>
    </p>
    <p class="info_item">
        <b class="text">Comments ${comments}</b>
    </p>
    <p class="info_item">
      <b class="text">Downloads ${downloads}</b>

    </p>
  </div>
</div>`
    )
        .join('');
}

function onClick(e) {
    e.preventDefault();
    getUser(valueInput).then(() => {
        pageforBtn += 1;
        lightbox.refresh();
    });
}