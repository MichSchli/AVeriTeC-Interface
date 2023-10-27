import React from 'react';
import styled from 'styled-components';
import SearchBar from './SearchBar';
import Card from '@material-ui/core/Card';
import Pagination from '@material-ui/lab/Pagination';
import axios from 'axios';
import { WarningRounded } from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import config from "../config.json"
import CountryPickerWithTooltip from './CountryPickerWithTooltip';

const SearchItemCard = styled(Card)`
  margin:10px;
  padding:10px;
`

const EntryCard = styled(Card)`
  margin:10px;
`

const CenterSearchBar = styled(SearchBar)`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 45px 15%;
    width:70%;
`
const CenterPagination = styled(Pagination)`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 30px 0px;
`

const CenterSpan = styled.h4`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 30px 0px;
`

const SearchItemHeader = styled.h4`
    margin:9px 0px;
    text-decoration: underline;
`

const SearchLink = styled.a`
    text-decoration: none;
`

const BreadcrumbSpan = styled.span`
    text-decoration: none;
    color: #484848;
    font-size:small;
`

const WarningDiv = styled.div`
    color:#D0342C;
    float:right;
`

const CountryBox = styled.div`
    margin:10px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 45px 20%;
    width:60%;
`

function ItemCard(item) {
    if (item.link.match(/^https?:\/\//)) {
        var source_url = item.link
        var displayed_url = item.link.split("/").slice(0, 3).join('/')
        var breadcrumbs = item.link.split("/").slice(3).join('/').replace("/", " > ")
    } else {
        var source_url = "http://" + item.link
        var displayed_url = item.link.split("/")[0]
        var breadcrumbs = item.link.split("/").slice(1).join('/').replace("/", " > ")
    }

    if (breadcrumbs.length > 0) {
        breadcrumbs = " > " + breadcrumbs
    }

    const allowed_length = 256
    let abstract = item.snippet.trim()
    if (abstract.length > allowed_length) {
        abstract = abstract.substring(0, allowed_length) + "..."
    }

    var problematic = ""

    if (item.is_misinfo) {
        problematic = <WarningDiv>
            <Tooltip title="This site is a known source of misinformation. Please consider using a different and/or additional source."><WarningRounded /></Tooltip>
        </WarningDiv>
    }

    return (<SearchItemCard key={item.link} variant="outlined">
        {problematic}
        <SearchLink target="_blank" rel="noopener noreferrer" href={source_url}>
            <BreadcrumbSpan>{displayed_url}</BreadcrumbSpan>
            <BreadcrumbSpan>{breadcrumbs}</BreadcrumbSpan>
            <SearchItemHeader>{item.title}</SearchItemHeader>
        </SearchLink>
        <div>

            {abstract}
        </div>
    </SearchItemCard>);
}

function SearchItemContainer(props) {
    const searchItemCards = props.searchItems.map(item => ItemCard(item));

    return (
        <div>
            {searchItemCards}
        </div>
    );
}

class SearchField extends React.Component {
    constructor(props) {
        super(props);

        /* Warning: I'm lazy, so there is a hack here; the site will crash if urls are not unique. We should ensure they are in any case though        
        */

        this.state = {
            searchQuery: "",
            page: 1,
            didSearch: false,
            searchItems: [
            ],
            countryCode: "GB"
        };

        this.doSearch = this.doSearch.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.resetPageAndSearch = this.resetPageAndSearch.bind(this);
        this.changeCountryCode = this.changeCountryCode.bind(this);
    }


    componentWillReceiveProps(props) {
        if (props.annotation_request.p1_annotation.location_ISO_code) {
            this.setState({ countryCode: props.annotation_request.p1_annotation.location_ISO_code });
        }
    }

    doSearch = () => {
        var query = this.state.searchQuery
        var claim_date = this.props.annotation_request.p1_annotation.claim_date? this.props.annotation_request.p1_annotation.claim_date : this.props.annotation_request.article.fact_checking_date
        var page = this.state.page
        var country_code = this.state.countryCode;

        console.log("Searching...")
        console.log(query)
        console.log(claim_date)
        console.log(page)
        console.log(country_code)

        var request = {
            method: "post",
            baseURL: config.api_url,
            url: "/search",
            data: {
                annotation_request: this.props.annotation_request,
                phase: this.props.phase,
                dataset: this.props.dataset,
                user_id: localStorage.getItem('user_id'),
                query: query,
                date: claim_date,
                page: page,
                country_code: country_code ? country_code : "gb", // If no country code is given, use gb
            },
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        };

        if (!country_code) {
            console.log("WARNING: No country code was given. Using GB for localization.")
        }

        axios(request).then((response) => {
            var newSearchItems = []
            console.log(response.data);
            if (response.data.data) {
                newSearchItems = response.data.data;
            }

            this.setState({
                searchItems: newSearchItems,
                didSearch: true
            });
        }).catch((error) => { window.alert(error) })
    }

    resetPageAndSearch = () => {
        this.setState({
            page: 1
        }, () => { this.doSearch() });
    }

    handlePageChange = (event, newPage) => {
        this.setState({
            page: newPage
        }, () => { this.doSearch() });
    }

    changeCountryCode = event => {
        const { name, value } = event.target;
        this.setState({ countryCode: value });
    }

    render() {
        let className = ''

        if (this.props.className !== undefined) {
            className = this.props.className
        }

        var searchResults = ""

        if (this.state.didSearch) {
            var emptyResultString = this.state.page === 1 ? <CenterSpan>No results were found</CenterSpan> : <CenterSpan>No further results were found</CenterSpan>
            var searchResultItems = this.state.searchItems.length > 0 ? <SearchItemContainer searchItems={this.state.searchItems}></SearchItemContainer> : emptyResultString

            searchResults = <div>
                {searchResultItems}
                <CenterPagination
                    count={10}
                    shape="rounded"
                    page={this.state.page}
                    onChange={this.handlePageChange}
                />
            </div>
        }

        return (
            <div data-tour="search" style={this.props.style} className={className}>
                <EntryCard>
                    <CenterSpan>Web Search</CenterSpan>
                    <CenterSearchBar
                        value={this.state.searchQuery}
                        onChange={(newSearchQuery) => this.setState({ searchQuery: newSearchQuery.target.value })}
                        onRequestSearch={this.resetPageAndSearch}
                        label="Search"
                        fullWidth
                    />
                    <CountryBox>
                        <CountryPickerWithTooltip name="localization" label="Localization" value={this.state.countryCode} onChange={this.changeCountryCode} tooltip="Here you can change the search engine localization setting if necessary." />
                    </CountryBox>
                    {searchResults}
                </EntryCard>
            </div>
        );
    }
}

export default SearchField;
