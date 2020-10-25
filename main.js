let searchValue;
let lastSearches = [];
let plot;
let favouriteArray = [];

// api ayarları
const apiSettings = {
    type : 's',
    apiKey : '82793c21',
    plot : plot == null ? '' : 'full',
}
const apiController = {
    searchValuelengthControl : 3,
    movieContainer : $(".movie_data"),
    // search araması
    search : (value) => {
        $.ajax({
            type : 'GET',
            url : `http://www.omdbapi.com/?${apiSettings.type}=${value}&apikey=${apiSettings.apiKey}&plot=${apiSettings.plot}`,
            success : (data) => {
                apiController.resultView(data,"s");
            },
            error : (response) => {
                console.log(response)
            }
        })
    },
    // favoriler için imdb id ile arama
    favourites : (data,searchType) => {
        let favouriteObj = {
            Response : "True",
            Search : new Array(),
            totalResults : ""
        }
        data.forEach(item => {
            $.ajax({
                type : 'GET',
                url : `http://www.omdbapi.com/?${searchType}=${item}&apikey=${apiSettings.apiKey}&plot=${apiSettings.plot}`,
                success : (data) => {
                    apiController.resultView(data,"f");
                },
                error : (response) => {
                    console.log(response);
                }
            })
        })
    },
    click : () => {
        apiController.search(searchValue);
        apiController.lastSearches(searchValue)
    },
    getSearchValue : (e) => {
        searchValue = $(e.target).val();
    },
    // search veya favoriye göre arama sonuçlarının basılması
    resultView : (data,type) => {
        type == "f" ? apiController.movieContainer = $(".favourite_data") : apiController.movieContainer = $(".movie_data");
        if(type == "f"){
            let movieCard = document.createElement("div");
            let movieImage = document.createElement("img");
            let movieInfo = document.createElement("div");
            let movieTitle = document.createElement("h2");
            let movieYear = document.createElement("span");
            let isFavourite = document.createElement("i");
            if(localStorage.getItem("favourite") && localStorage.getItem("favourite").includes(data.imdbID)){
                isFavourite.className = "is_favourite fas fa-heart";
            }else{
                isFavourite.className = "is_favourite far fa-heart";
            }
            movieCard.setAttribute("data-ID",data.imdbID);
            movieCard.className = "col-sm-6 col-md-4 col-lg-3 mb-3 movie_card";
            movieInfo.className = "movie_info";
            movieTitle.textContent = data.Title;
            movieImage.src = data.Poster;
            movieImage.alt = data.Title;
            movieYear.textContent = data.Year;
            movieInfo.appendChild(movieTitle);
            movieInfo.appendChild(movieYear);
            movieCard.appendChild(movieImage);
            movieCard.appendChild(movieInfo);
            movieCard.appendChild(isFavourite);
            apiController.movieContainer.append(movieCard);
        }else{
            apiController.movieContainer.html("");
            data.Search.forEach(item => {
                let movieCard = document.createElement("div");
                let movieImage = document.createElement("img");
                let movieInfo = document.createElement("div");
                let movieTitle = document.createElement("h2");
                let movieYear = document.createElement("span");
                let isFavourite = document.createElement("i");
                if(localStorage.getItem("favourite") && localStorage.getItem("favourite").includes(item.imdbID)){
                    isFavourite.className = "is_favourite fas fa-heart";
                }else{
                    isFavourite.className = "is_favourite far fa-heart";
                }
                movieCard.setAttribute("data-ID",item.imdbID);
                movieCard.className = "col-sm-6 col-md-4 col-lg-3 mb-3 movie_card";
                movieInfo.className = "movie_info";
                movieTitle.textContent = item.Title;
                movieImage.src = item.Poster;
                movieImage.alt = item.Title;
                movieYear.textContent = item.Year;
                movieInfo.appendChild(movieTitle);
                movieInfo.appendChild(movieYear);
                movieCard.appendChild(movieImage);
                movieCard.appendChild(movieInfo);
                movieCard.appendChild(isFavourite);
                apiController.movieContainer.append(movieCard);
            });
        }
        // favori iconunun düzenlenmesi
        $(".is_favourite").on("click", (e) => {
            console.log("çağrıldı")
            let target = $(e.target);
            let currentMovie = target.parents(".movie_card").data("id");
            if(target.hasClass("far")){
                target.removeClass("far")
                target.addClass("fas")
            }else{
                target.addClass("far")
                target.removeClass("fas")
            }
            favouriteHelper(currentMovie);
        })
    },
    // Son aramaların basılması ve son 10 arama kontrolü
    lastSearches : (s) => {
        let lastSearch = document.createElement("div");
        let lastSearchData = document.createElement("div");
        let removeIcon = document.createElement("i");
        removeIcon.className = "fas fa-minus-circle remove_history";
        lastSearch.className = "last_search col-sm-3 col-lg-2";
        lastSearchData.className = "last_search_data";
        if(lastSearches.length <= 9){
            lastSearches.unshift(s)
        }else{
            lastSearches.pop();
            lastSearches.unshift(s)
            $(".last_search:last-child").remove();
        }
        lastSearchData.append(s);
        lastSearch.append(lastSearchData);
        lastSearch.append(removeIcon);
        $("#lastSearches").prepend(lastSearch);
        $(".remove_history").on("click",(e) => {
            $(e.target).parents(".last_search").remove()
        })
    }
}
// Sayfa yüklenirken favorilerin çekilmesi
let favouriteList = () => {
    if(localStorage.getItem("favourite")){
        favouriteArray = JSON.parse(localStorage.getItem("favourite"));
    }else{
        favouriteArray = [];
    }
}
favouriteList();

// helper favourite function
let favouriteHelper = (e) => {
    if(localStorage.getItem("favourite")){
        if(localStorage.getItem("favourite").includes(e)){
            favouriteArray = favouriteArray.filter(item => item !== e)
            if($("[data-id=" + e + "").parents(".favourite_data").length){
                $("[data-id=" + e + "").remove();
            }
        }else{
            favouriteArray.unshift(e);
        }
        localStorage.setItem("favourite",JSON.stringify(favouriteArray));
    }else{
        favouriteArray = [];
        favouriteArray.unshift(e);
        localStorage.setItem("favourite",JSON.stringify(favouriteArray));
    }
}
apiController.favourites(favouriteArray,"i");
$("#searchButton").on("click",apiController.click);
$("#searchValue").on("keyup",apiController.getSearchValue);