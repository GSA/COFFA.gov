// Filter based on two factors + alphabetical sort
// Uses URI hash as trigger allowing direct links etc
// Losely based on: http://isotope.metafizzy.co/filtering.html#url-hash

jQuery(document).ready(function ($) {
    let currentYear = new Date().getFullYear();
    const archivedYears = 7;
    const endYear = currentYear - archivedYears;
    let notArchivedYears = [];
    for (let i = currentYear; i >= endYear; i--) {
        notArchivedYears.push(`.${i}:not(.archived)`);
    }
    let notArchivedFilter = notArchivedYears.join(", ");
    var initialFilter = notArchivedFilter;
    $("#filter-list-archived").attr("data-filter", initialFilter);

    var $container = $(".resources");

    // Filter isotope
    $container.isotope({
        // options
        itemSelector: ".policy",
        layoutMode: "masonry",
        getSortData: {
            date: "p"
        }
    });

    var iso = $container.data("isotope");
    var $filterCount = $(".filter-count");

    function updateFilterCount() {
        if (iso != null) {
            $filterCount.text(iso.filteredItems.length + " items");
        }
    }

    var sortValue = false;
    $(".sort").on("click", function () {
        var currentHash = location.hash;
        if ($(this).hasClass("checked")) {
            sortValue = false;
            location.hash = currentHash.replace(/&sort=([^&]+)/i, "");
        } else {
            sortValue = $(this).attr("data-sort-value");
            location.hash = currentHash + "&sort=" + encodeURIComponent(sortValue);
        }
    });

    var filters = {};
    $(".filter-list a").on("click", filterSelect);

    function filterSelect() {
        var hashFilter = getHashFilter();
        filters["focus_area"] = hashFilter["focus_area"];
        filters["sub_focus_area"] = hashFilter["sub_focus_area"];
        filters["type"] = hashFilter["type"];
        filters["source"] = hashFilter["source"];
        filters["fiscal_year"] = hashFilter["fiscal_year"];
        filters["archived"] = hashFilter["archived"];
        var currentFilter = $(this).attr("data-filter");
        var $navGroup = $(this).parents(".filter-list");
        var filterGroup = $navGroup.attr("data-filter-group");

        if (filterGroup === "archived") {
            filters["archived"] = (hashFilter["archived"] === initialFilter) ? "*" : initialFilter;
        } else {
            filters[filterGroup] = (hashFilter[filterGroup] === currentFilter) ? "*" : currentFilter;
        }

        var newHash =
            "focus_area=" + encodeURIComponent(filters["focus_area"]) +
            "&sub_focus_area=" + encodeURIComponent(filters["sub_focus_area"]) +
            "&type=" + encodeURIComponent(filters["type"]) +
            "&source=" + encodeURIComponent(filters["source"]) +
            "&fiscal_year=" + encodeURIComponent(filters["fiscal_year"]) +
            "&archived=" + encodeURIComponent(filters["archived"]);

        if (sortValue) {
            newHash = newHash + "&sort=" + encodeURIComponent(sortValue);
        }
        location.hash = newHash;
    } // filterSelect

    function onHashChange() {
        var hashFilter = getHashFilter();
        var filterString = "";
        var groups = ["focus_area", "sub_focus_area", "type", "source", "fiscal_year"];
        groups.forEach(function (group) {
            if (hashFilter[group] !== "*") {
                filterString += hashFilter[group];
            }
        });
        filterString += hashFilter["archived"];
        if (hashFilter) {
            $container.isotope({
                filter: decodeURIComponent(filterString),
                sortBy: hashFilter["sorts"]
            });

            updateFilterCount();
            window.scrollTo({
                top: document.querySelector("#filterTop").offsetTop,
                behavior: "smooth"
            });

            if (hashFilter["sorts"]) {
                $(".sort").addClass("checked");
            } else {
                $(".sort").removeClass("checked");
            }
            $(".filter-list").find(".checked").removeClass("checked").attr("aria-checked", "false");
            $(".filter-list").each(function () {
                var group = $(this).attr("data-filter-group");
                if (group !== "archived") {
                    $(this).find("a").each(function () {
                        if ($(this).attr("data-filter") === hashFilter[group]) {
                            $(this).addClass("checked").attr("aria-checked", "true");
                        }
                    });
                }
            });
            if (hashFilter["archived"] === "*") {
                $(".filter-list[data-filter-group='archived'] a").addClass("checked").attr("aria-checked", "true");
            } else {
                $(".filter-list[data-filter-group='archived'] a").removeClass("checked").attr("aria-checked", "false");
            }
        }
    } // onHashChange

    function getHashFilter() {
        var focus_area = location.hash.match(/focus_area=([^&]+)/i);
        var sub_focus_area = location.hash.match(/sub_focus_area=([^&]+)/i);
        var type = location.hash.match(/type=([^&]+)/i);
        var source = location.hash.match(/source=([^&]+)/i);
        var fiscal_year = location.hash.match(/fiscal_year=([^&]+)/i);
        var archived = location.hash.match(/archived=([^&]+)/i);
        var sorts = location.hash.match(/sort=([^&]+)/i);

        var hashFilter = {};
        hashFilter["focus_area"] = focus_area ? decodeURIComponent(focus_area[1]) : "*";
        hashFilter["sub_focus_area"] = sub_focus_area ? decodeURIComponent(sub_focus_area[1]) : "*";
        hashFilter["type"] = type ? decodeURIComponent(type[1]) : "*";
        hashFilter["source"] = source ? decodeURIComponent(source[1]) : "*";
        hashFilter["fiscal_year"] = fiscal_year ? decodeURIComponent(fiscal_year[1]) : "*";
        // Use initialFilter as default for archived if not present in the hash.
        hashFilter["archived"] = archived ? decodeURIComponent(archived[1]) : initialFilter;
        hashFilter["sorts"] = sorts ? decodeURIComponent(sorts[1]) : "";
        return hashFilter;
    } // getHashFilter

    window.onhashchange = onHashChange;
    onHashChange();
});
