'use strict';

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================================================
    // #region handle visibility of filter popup
    // ==========================================================================================
    const mushroomSearch = document.querySelector('#mushroom-search');
    const filterPopup = document.querySelector('#filter-popup');
    const mobileFilterButton = document.querySelector('#mobile-filter-button');
    const desktopFilterButton = document.querySelector('#desktop-filter-button');
    const closeFilter = document.querySelector('#close-filter');

    function openFilterPopup() {
        mushroomSearch.classList.add('filter-open');
        desktopFilterButton.classList.add('filter-open');
        filterPopup.classList.add('filter-open');
    }

    function closeFilterPopup() {
        mushroomSearch.classList.remove('filter-open');
        desktopFilterButton.classList.remove('filter-open');
        filterPopup.classList.remove('filter-open');
    }

    mobileFilterButton.addEventListener('click', () => {
        openFilterPopup();
    });

    desktopFilterButton.addEventListener('click', () => {
        openFilterPopup();
    });
    
    closeFilter.addEventListener('click', () => {
        closeFilterPopup();
    });
    // #endregion

    // ==========================================================================================
    // #region delete search input
    // ==========================================================================================
    const searchInput = document.querySelector('#search-input');
    const deleteInput = document.querySelector('#delete-input');

    deleteInput.addEventListener('click', () => {
        searchInput.value="";
    });
    // #endregion
    
    // ==========================================================================================
    // #region handle mushroom size slider (in filter popup) 
    // ==========================================================================================
    const mushroomSize = document.querySelector('#mushroom-size');
    const sizeSliderTrack = document.querySelector('#size-slider-track');
    const sizeSliderFrom = document.querySelector('#size-slider-from');
    const sizeSliderTo = document.querySelector('#size-slider-to');

    // set handles to correct position in the beginning
    sizeSliderFrom.style.left = '0%';
    sizeSliderTo.style.left = '100%';

    // functions and event listeners to move the slider handles
    let startX, startLeft;
    let isDragging = false;
   
    function sliderPointerDown (e) {
        e.target.setPointerCapture(e.pointerId);
        isDragging = true;
        startX = e.clientX;
        startLeft = parseFloat(e.target.style.left); 
        // the handle that was used last is in front of the other, so they never block each other
        sizeSliderFrom.style.zIndex = "1";
        sizeSliderTo.style.zIndex = "1";
        e.target.style.zIndex = "2";
    };

    function sliderPointerMove (e) {
        if (!isDragging) {
            return;
        }
        e.preventDefault();
        sizeSliderTrack.classList.add('in-use');
        // movement of pointer in px
        const dx = e.clientX - startX;
        // movement of slider in % of width of track
        const dPercent = dx/parseFloat(getComputedStyle(sizeSliderTrack).width)*100;
        // set new position of slider
        if (e.target.id === "size-slider-from") {
            const newPosition = Math.max(0, Math.min(parseFloat(sizeSliderTo.style.left), (startLeft + dPercent)));
            sizeSliderFrom.style.left = `${newPosition}%`;
        } else if (e.target.id === "size-slider-to") {
            const newPosition = Math.max(parseFloat(sizeSliderFrom.style.left), Math.min(100, (startLeft + dPercent)));
            sizeSliderTo.style.left = `${newPosition}%`;
        }
        updateSize();
    };

    function sliderPointerUp (e) {
        isDragging = false;
        e.target.releasePointerCapture(e.pointerId);
        // reset look if not in use
        if (parseFloat(sizeSliderFrom.style.left) === 0 && parseFloat(sizeSliderTo.style.left) === 100) {
            sizeSliderTrack.classList.remove('in-use');
            mushroomSize.textContent = "alle Werte";
        }
    };

    function getMushroomSize() {
        const minSize = Math.round(1 + parseFloat(sizeSliderFrom.style.left) / 100 * 24);
        const maxSize = Math.round(1 + parseFloat(sizeSliderTo.style.left) / 100 * 24);
        return {min: minSize, max: maxSize};
    }
    
    function updateSize() {
        const size = getMushroomSize();
        mushroomSize.textContent = `${size.min} - ${size.max} cm`;
    }

    sizeSliderFrom.addEventListener('pointerdown', sliderPointerDown);
    sizeSliderFrom.addEventListener('pointermove', sliderPointerMove);
    sizeSliderFrom.addEventListener('pointerup', sliderPointerUp);

    sizeSliderTo.addEventListener('pointerdown', sliderPointerDown);
    sizeSliderTo.addEventListener('pointermove', sliderPointerMove);
    sizeSliderTo.addEventListener('pointerup', sliderPointerUp);
    // #endregion

    // ==========================================================================================
    // #region handle calendar (in filter popup)
    // ==========================================================================================
    const resetMonths = document.querySelector('#reset-months');
    const months = document.querySelectorAll('.month');
    let startMonth = null;
    let endMonth = null;

    resetMonths.disabled = true;
    
    function removeMonthClasses() {
        months.forEach (month => {
            month.classList.remove('chosen', 'hover-to', 'hover-in-between', 'from', 'to', 'in-between');
        });
    }

    function monthClick(clickedMonth) {
        // if start and end were already chosen start fresh
        if (startMonth != null && endMonth != null) {
            removeMonthClasses();
            startMonth = null;
            endMonth = null;
        }
        // set new start Month
        if (startMonth === null && endMonth === null) {
            clickedMonth.classList.add('chosen');
            startMonth = clickedMonth;
            resetMonths.disabled = false;
        // set new end Month
        } else {
            endMonth = clickedMonth;
            const startMonthNumber = parseFloat(startMonth.dataset.month);
            const endMonthNumber = parseFloat(endMonth.dataset.month);
            if (startMonthNumber != endMonthNumber) {
                startMonth.classList.remove('chosen');
                startMonth.classList.add('from');
                clickedMonth.classList.add('to');
            }
            months.forEach (month => {
                month.classList.remove('hover-to', 'hover-in-between');
                const monthNumber = parseFloat(month.dataset.month);
                if (endMonthNumber > startMonthNumber && monthNumber > startMonthNumber && monthNumber < endMonthNumber) {
                    month.classList.add('in-between');
                } else if (endMonthNumber < startMonthNumber && (monthNumber < endMonthNumber || monthNumber > startMonthNumber)) {
                    month.classList.add('in-between');
                }
            });
        }
    }

    function monthHover(hoveredMonth) {
        if (!(startMonth != null && endMonth === null)) return;
        const startMonthNumber = parseFloat(startMonth.dataset.month);
        const hoveredMonthNumber = parseFloat(hoveredMonth.dataset.month);
        if (startMonthNumber === hoveredMonthNumber) return;
        months.forEach (month => {
            const monthNumber = parseFloat(month.dataset.month);
            if (hoveredMonthNumber > startMonthNumber && monthNumber > startMonthNumber && monthNumber < hoveredMonthNumber) {
                month.classList.add('hover-in-between');
            } else if (hoveredMonthNumber < startMonthNumber && (monthNumber < hoveredMonthNumber || monthNumber > startMonthNumber)) {
                month.classList.add('hover-in-between');
            }
        });
        hoveredMonth.classList.add('hover-to');
        startMonth.classList.add('hover-from');
    }

    function endMonthHover() {
        months.forEach (month => {
            month.classList.remove('hover-to', 'hover-in-between', 'hover-from');
        });
    }
    
    months.forEach (month => {
        month.addEventListener('click', () => monthClick(month));
        month.addEventListener('mouseenter', () => monthHover(month));
        month.addEventListener('mouseleave', () => endMonthHover());
    });

    function resetCalendar() {
        removeMonthClasses();
        startMonth = null;
        endMonth = null;
        resetMonths.disabled = true;
    }

    resetMonths.addEventListener('click', resetCalendar);
    // #endregion

    // ==========================================================================================
    // #region reset filters
    // ==========================================================================================
    const resetButton = document.querySelector('#reset-filter');
    const rareMushrooms = document.querySelector('#rare-switch input');
    const dropDownInput = document.querySelectorAll('.drop-down-input'); // are checked if the drop down menu is open

    function resetFilter() {
        // reset search field
        searchInput.value="";

        // reset calendar
        resetCalendar();

        // reset size slider
        sizeSliderFrom.style.left = '0%';
        sizeSliderTo.style.left = '100%';
        sizeSliderTrack.classList.remove('in-use');
        mushroomSize.textContent = "alle Werte";

        // reset filter toggle
        const checkedToggleInput = document.querySelectorAll('.filter-toggle-input:checked');
        checkedToggleInput.forEach(element => {
            element.checked = false;
        });

        // set "rare mushrooms" to checked
        rareMushrooms.checked = true;

        // collapse sections
        dropDownInput.forEach(checkbox => {
            checkbox.checked = false;
        })
    }

    resetButton.addEventListener('click', resetFilter);
    // #endregion

    // ==========================================================================================
    // #region handle media query change
    // ==========================================================================================
    let isMobile = window.matchMedia('(max-width: 767px)');

    const mainNavigation = document.querySelector('#main-navigation');

    function mediaChange() {
        if (isMobile.matches) { 
            // turn transitions off that are only needed in desktop mode
            mainNavigation.style.transition = 'none';
            // turn transitions for mobile mode back on after short time
            setTimeout(() => filterPopup.style.transition = 'var(--transition-on)', 800);
        } else { 
            // turn transitions off that are only needed in mobile mode 
            filterPopup.style.transition = 'none';
            // turn transitions for desktop mode back on after short time
            setTimeout(() => {
                mainNavigation.style.transition = 'var(--transition-on';
            }, 800);
        }
    }

    isMobile.addEventListener('change', mediaChange);
    
    if(!isMobile.matches) {
       openFilterPopup(); //start with filters open in desktop mode
    };

    // #endregion

    // ==========================================================================================
    // #region load mushrooms
    // ==========================================================================================
    const applyFilter = document.querySelector('#apply-filter');

    function getQueryParams() {
        const params = new URLSearchParams;
        
        // text input
        const searchText = searchInput.value;
        if (searchText != "") {
            params.append("text", searchText)
        }

        // toggle filter input
        const checkedToggleInput = document.querySelectorAll('.filter-toggle-input:checked');
        checkedToggleInput.forEach(element => {
            params.append(element.dataset.filter, element.dataset.value);
        });

        // calendar
        if(startMonth && endMonth) {
            params.append("from", startMonth.dataset.month);
            params.append("to", endMonth.dataset.month);
        }

        // size
        const size = getMushroomSize()
        if(size.min > 1) {
            params.append("min", size.min);
        }
        if(size.max < 25) {
            params.append("max", size.max);
        }

        return params;
    }
    
    applyFilter.addEventListener('click', () => {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        console.log(getQueryParams().toString());
    });
    // #endregion

    // ==========================================================================================
    // #region handle mushroom profile
    // ==========================================================================================

    // change between search and profile
    const mushroomProfile = document.querySelector('#mushroom-profile');
    const mushroomTiles = document.querySelectorAll('.mushroom');
    const closeProfileButton = document.querySelector('#close-profile');
    let searchScrollPosition = 0;

    function openProfile() {
        searchScrollPosition = window.scrollY;
        mushroomSearch.hidden = true;
        mushroomProfile.hidden = false;
        window.scrollTo(0, 0);
    }

    function closeProfile() {
        mushroomSearch.hidden = false;
        mushroomProfile.hidden = true;
        window.scrollTo(0, searchScrollPosition);
    }

    mushroomTiles.forEach(tile => tile.addEventListener('click', openProfile));
    closeProfileButton.addEventListener('click', closeProfile);

    // handle visibility of gallery arrows
    const galleryPictureWrapper = document.querySelector('#gallery-picture-wrapper');
    const galleryArrowL = document.querySelector('#gallery-arrow-l');
    const galleryArrowR = document.querySelector('#gallery-arrow-r');

    function handleArrowVisibility() {
        const scrollPosition = galleryPictureWrapper.scrollLeft;
        const maxScroll = galleryPictureWrapper.scrollWidth - galleryPictureWrapper.clientWidth;
        if (scrollPosition === 0) {
            galleryArrowL.style.opacity = 0;
            galleryArrowR.style.opacity = 1;
        } else if (scrollPosition >= maxScroll) {
            galleryArrowL.style.opacity = 1;
            galleryArrowR.style.opacity = 0;
        } else {
            galleryArrowL.style.opacity = 1;
            galleryArrowR.style.opacity = 1;
        }
    }

    galleryPictureWrapper.addEventListener('scroll', handleArrowVisibility);

    // enable scrolling by clicking on the arrows
    const scrollStep = 200;
    
    function scrollGalleryRight() {
        const currentScrollPosition = galleryPictureWrapper.scrollLeft;
        const maxScroll = galleryPictureWrapper.scrollWidth - galleryPictureWrapper.clientWidth;
        galleryPictureWrapper.scrollLeft = Math.min(currentScrollPosition + scrollStep, maxScroll);
    }

    function scrollGalleryLeft() {
        const currentScrollPosition = galleryPictureWrapper.scrollLeft;
        const maxScroll = galleryPictureWrapper.scrollWidth - galleryPictureWrapper.clientWidth;
        galleryPictureWrapper.scrollLeft = Math.max(currentScrollPosition - scrollStep, 0);
    }

    galleryArrowR.addEventListener('click', scrollGalleryRight);
    galleryArrowL.addEventListener('click', scrollGalleryLeft);

    // open gallery zoom
    const galleryPictures = document.querySelectorAll('.gallery-pic');
    const zoomedPicture = document.querySelector('#zoomed-picture');
    const zoomedPictureView = document.querySelector('#zoomed-picture-view');
    let indexZoomedPic = 0;
    const body = document.querySelector('body');

    galleryPictures.forEach((pic, index) => {
        pic.addEventListener('click', () => {
            zoomedPicture.src = pic.src;
            zoomedPictureView.hidden = false;
            body.classList.add('no-scroll');
            indexZoomedPic = index;
        });
    });

    // change pictures in gallery zoom with arrows
    const zoomedPictureArrowL = document.querySelector('#zoomed-picture-arrow-l');
    const zoomedPictureArrowR = document.querySelector('#zoomed-picture-arrow-r');

    function scrollZoomedPicLeft () {
        indexZoomedPic = (indexZoomedPic - 1 + galleryPictures.length) % galleryPictures.length;
        zoomedPicture.src = galleryPictures[indexZoomedPic].src;
    }

    function scrollZoomedPicRight () {
        indexZoomedPic = (indexZoomedPic + 1) % galleryPictures.length;
        zoomedPicture.src = galleryPictures[indexZoomedPic].src;
    }

    zoomedPictureArrowL.addEventListener('click', scrollZoomedPicLeft);
    zoomedPictureArrowR.addEventListener('click', scrollZoomedPicRight);

    // change pictures in gallery zoom with touch
    let galleryPointerDownX = 0;
    
    zoomedPictureView.addEventListener('pointerdown', (e) => {
        galleryPointerDownX = e.clientX;
        zoomedPictureView.setPointerCapture(e.pointerId);
    });

    zoomedPictureView.addEventListener('pointerup', (e) => {
        const diffX = e.clientX - galleryPointerDownX;
        if (diffX > 50) {
            scrollZoomedPicLeft();
        } else if (diffX < -50) {
            scrollZoomedPicRight();
        }
    });

    // change pictures in gallery zoom with scroll
    let galleryWheelBlocked = false;
    let galleryWheelTimeout;
    
    zoomedPictureView.addEventListener('wheel', (e) => {
        if (galleryWheelBlocked) {
            clearTimeout(galleryWheelTimeout);
            galleryWheelTimeout = setTimeout(() => {galleryWheelBlocked = false;}, 200);
            return;
        }
        galleryWheelBlocked = true;
        if (e.deltaX > 0) {
            scrollZoomedPicLeft();
        } else {
            scrollZoomedPicRight();
        }
        galleryWheelTimeout = setTimeout(() => {galleryWheelBlocked = false;}, 200);
    })

    // close gallery zoom
    const zoomedPictureClose = document.querySelector('#zoomed-picture-close');
    zoomedPictureClose.addEventListener('click', () => {
        zoomedPictureView.hidden = true;
        body.classList.remove('no-scroll');
    })

    // #endregion
});
