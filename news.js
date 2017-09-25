var hn = {
	searchTerm: '',
	pageNumber: 0,
	perPage: 20,
	results: null,

	init: function() {
		var searchButton = document.getElementById("search-button");
		searchButton.addEventListener('click', this.searchClicked.bind(this))
		var loadMoreBtn = document.getElementById("load-more");
		loadMoreBtn.addEventListener('click', this.loadMoreClicked.bind(this))
	},

	searchClicked: function(event) {
		event.preventDefault();
		var searchTerm = document.getElementById('search-term').value;
		if (searchTerm != this.searchTerm) {
			this.searchTerm = searchTerm;
			this.searchApi(searchTerm, this.pageNumber, this.perPage);
		}
	},

	loadMoreClicked: function(event) {
		console.log("loadMoreClicked");
		this.pageNumber++;
		this.perPage++;
		this.searchApi(this.searchTerm, this.pageNumber, this.perPage);
	},

	searchApi: function(searchTerm, pageNumber, perPage) {
		var that = this;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		  if (this.readyState == 4 && this.status == 200) {
		  	that.processData(JSON.parse(xhttp.responseText));
		  }
		};
		var url = "https://hn.algolia.com/api/v1/search?query=" + searchTerm + "&page=" + pageNumber + "&hitsPerPage=" + perPage ;
		xhttp.open("GET", url, true);
		xhttp.send();
	},

	fetchAuthorSubmissionCount: function(author, index) {
		var that = this;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		  if (this.readyState == 4 && this.status == 200) {
		  	var submission_count = JSON.parse(xhttp.responseText).submission_count;
		  	var elem = document.getElementById(author + '-' + index);
		  	elem.textContent = ' (' + submission_count + ')';
		  }
		};
		var url = "https://hn.algolia.com/api/v1/users/" + author;
		xhttp.open("GET", url, true);
		xhttp.send();
	},

	processData: function(results) {
		console.log(results.query);
		console.log(this.searchTerm);
		var gridElem = document.getElementById("grid");
		gridElem.innerHTML = '';
		if ((this.results == null) || (results.page == 0)) {
			this.results = results;
			this.results.hits.forEach(function(hit, index) {
				this.fetchAuthorSubmissionCount(hit.author, index);
			}.bind(this))
			this.renderTable();
		} else {
			this.results.hits = this.results.hits.concat(results.hits);
			this.results.hits.forEach(function(hit, index) {
				this.fetchAuthorSubmissionCount(hit.author, index);
			}.bind(this))
			this.renderTable();
		}
	},

	renderTable: function() {
		// Create a fragment
		var fragment = document.createDocumentFragment();
		var titleRow = document.createElement("tr");
		var titleCol1 = document.createElement("td");
		titleCol1.textContent = "Title";
		titleRow.appendChild(titleCol1);
		var titleCol2 = document.createElement("td");
		titleCol2.textContent = "Author (Submission Count)";
		titleRow.appendChild(titleCol2);
		fragment.appendChild(titleRow);

		if (this.results.hits.length == 0) {
			var noDataSpan = document.createElement("span");
			noDataSpan.textContent = "No Data Found";
			fragment.appendChild(noDataSpan);
		} else {
			for (var i = 0; i < this.results.hits.length; i++) {
				var rowData = this.results.hits[i];
				var row = document.createElement("tr");
				var column1 = document.createElement("td");
				var link = document.createElement("a");
				link.textContent = rowData.title || rowData.story_title;
				link.setAttribute("href", rowData.url || rowData.story_url);
				column1.appendChild(link);
				row.appendChild(column1);
				var column2 = document.createElement("td");
				column2.textContent = rowData.author;
				var span = document.createElement("span");
				span.textContent = "";
				span.setAttribute("id", rowData.author + '-' + i);
				column2.appendChild(span);
				row.appendChild(column2);
				fragment.appendChild(row);
			}
			var loadMoreBtn = document.getElementById("load-more");
			loadMoreBtn.classList.remove("hidden");
		}

		var gridElem = document.getElementById("grid");
		gridElem.appendChild(fragment);
	},
}


hn.init();
