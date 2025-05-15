// Filter based on two factors + alphabetical sort
// Uses URI hash as trigger allowing direct links etc
// Losely based on: http://isotope.metafizzy.co/filtering.html#url-hash

jQuery(document).ready(function ($) {
    const currentYear = new Date().getFullYear();
    const archivedYears = 7;
    const endYear = currentYear - archivedYears;
    const notArchivedYears = [];
    for (let i = currentYear; i >= endYear; i--) {
        notArchivedYears.push(`.${i}:not(.archived)`);
    }
    const initialFilter = notArchivedYears.join(", ");
    $("#filter-list-archived").attr("data-filter", initialFilter);

    const $container = $(".resources");
    $container.isotope({
        itemSelector: ".policy",
        layoutMode: "masonry",
        getSortData: { date: "p" }
    });
    const iso = $container.data("isotope");
    const $filterCount = $(".filter-count");

    function updateFilterCount() {
        $filterCount.text(iso.filteredItems.length + " items");
    }

    let sortValue = "";
    $(".sort").on("click", function () {
        const currentHash = location.hash;
        if ($(this).hasClass("checked")) {
            sortValue = "";
            location.hash = currentHash.replace(/&sort=[^&]*/i, "");
        } else {
            sortValue = $(this).attr("data-sort-value");
            location.hash = currentHash + "&sort=" + encodeURIComponent(sortValue);
        }
    });

    const filters = {};
    $(".filter-list a").on("click", filterSelect);

    function filterSelect() {
        const hashFilter = getHashFilter();
        filters.focus_area    = hashFilter.focus_area;
        filters.sub_focus_area= hashFilter.sub_focus_area;
        filters.type          = hashFilter.type;
        filters.source        = hashFilter.source;
        filters.fiscal_year   = hashFilter.fiscal_year;
        filters.archived      = hashFilter.archived;

        const currentFilter = $(this).attr("data-filter");
        const group = $(this).closest(".filter-list").attr("data-filter-group");

        if (group === "archived") {
            filters.archived = (hashFilter.archived === initialFilter) ? "*" : initialFilter;
        } else {
            filters[group] = (hashFilter[group] === currentFilter) ? "*" : currentFilter;
        }

        let parts = [
            "focus_area="    + encodeURIComponent(filters.focus_area),
            "sub_focus_area="+ encodeURIComponent(filters.sub_focus_area),
            "type="          + encodeURIComponent(filters.type),
            "source="        + encodeURIComponent(filters.source),
            "fiscal_year="   + encodeURIComponent(filters.fiscal_year),
            "archived="      + encodeURIComponent(filters.archived)
        ];
        if (sortValue) parts.push("sort=" + encodeURIComponent(sortValue));
        location.hash = parts.join("&");
    }

    function onHashChange() {
        const hashFilter = getHashFilter();
        const groups = ["focus_area","sub_focus_area","type","source","fiscal_year"];
        const baseSelector = groups
            .filter(g => hashFilter[g] !== "*")
            .map(g => hashFilter[g])
            .join("");

        let filterString;
        if (hashFilter.archived === "*") {
            filterString = baseSelector || "*";
        } else {
            const years = hashFilter.archived.split(",").map(s => s.trim());
            if (baseSelector) {
                filterString = years.map(y => baseSelector + y).join(", ");
            } else {
                filterString = years.join(", ");
            }
        }

        $container.isotope({
            filter: filterString,
            sortBy: hashFilter.sort || undefined
        });
        updateFilterCount();
        window.scrollTo({
            top: $("#filterTop").offset().top,
            behavior: "smooth"
        });

        $(".sort").toggleClass("checked", !!hashFilter.sort);
        $(".filter-list").each(function () {
            const grp = $(this).attr("data-filter-group");
            $(this).find(".checked")
                   .removeClass("checked")
                   .attr("aria-checked", "false");
            if (grp !== "archived") {
                $(this).find("a[data-filter='" + hashFilter[grp] + "']")
                       .addClass("checked")
                       .attr("aria-checked", "true");
            } else {
                $(this).find("a")
                       .toggleClass("checked aria-checked", hashFilter.archived === "*");
            }
        });
    }

    function getHashFilter() {
        const params = {};
        location.hash.slice(1).split("&").forEach(pair => {
            const [k,v] = pair.split("=");
            if (k) params[k] = decodeURIComponent(v || "");
        });
        return {
            focus_area:     params.focus_area     || "*",
            sub_focus_area: params.sub_focus_area || "*",
            type:           params.type           || "*",
            source:         params.source         || "*",
            fiscal_year:    params.fiscal_year    || "*",
            archived:       params.archived       || initialFilter,
            sort:           params.sort           || ""
        };
    }
    $(window).on("hashchange", onHashChange);
    onHashChange();
});