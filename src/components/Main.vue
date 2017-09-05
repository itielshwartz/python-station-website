<template>
  <div id="app">
    <github-corners repo="itielshwartz/python-station-website" bg-color="rgba(0, 0, 0)"></github-corners>

    <b-navbar toggleable type="inverse" id="nav">
      <b-link class="navbar-brand" to="#">
        <span>Python Station - </span>
        <span id="subtitle">projects from across the blogosfere</span>
      </b-link>
      <div class="justify-content-centermy-1 col"/>


      <b-nav is-nav-bar id="leftNav">
        <b-popover :triggers="['hover','click']" placement="bottom" :debounce="1"
                   content="A crusted list of the top python packages featured on python blogs (Based on planetpython.org) ">
          <b-nav-item>
            About
          </b-nav-item>
        </b-popover>

        <b-nav-item href="https://github.com/itielshwartz/python-station" target="_blank">Backend</b-nav-item>
        <b-nav-item href="http://etlsh.com/2017/09/04/scraping-planet-python-and-getting-the-history-of-python-blogs-and-projects/" target="_blank">Building process</b-nav-item>
      </b-nav>

    </b-navbar>
    <div class="justify-content-centermy-12 row"/>
    <div class="row" id="searchBar">
      <div class="col-md-3" style="padding-right:5px">

        <b-form-fieldset :label-size="2">
          <b-form-input v-model="filter" placeholder="Search open-source python project"
                        :disabled="searchDisabled"></b-form-input>
        </b-form-fieldset>
      </div>
      <div class="col-md-3" style="padding-right:5px">

        <p id="searchResult">Results: {{numResults}}</p>
      </div>

      <div class="col-md-6" style="padding-right:5px">
        <b-form-radio id="radioGroup" v-model="selected" v-on:change="changeBusy" :options="options"></b-form-radio>
      </div>

    </div>
    <div class="row">
      <b-table bordered responsive striped hover :items="myProvider" :fields="fields" :busy="isBusy"
               :current-page="currentPage"
               :per-page="perPage"
               :filter="filter" :bordered="true" sort-by="clean_last_mention" id="mainTable" show-empty>

        <template slot="name" scope="item">
          <b-popover :triggers="['hover','click']" :content="item.item.description" placement="right" :debounce="1">
            <b-button variant="link" :href="item.item.project_url" target="_blank">
              {{item.item.full_name}}
            </b-button>
          </b-popover>

        </template>
        <template slot="clean_last_mention" scope="item">
          <b-button variant="outline-success" size="sm" :href=item.item.blogs_ref[0] target="_blank">
            {{item.item.clean_last_mention}}
          </b-button>
        </template>
        <template slot="blogs_ref" scope="item">
          <b-dropdown text="Blogs" right size="sm">
            <div v-for="url in item.value">
              <b-dropdown-item :href=url target="_blank">
                {{url}}
              </b-dropdown-item>
            </div>
          </b-dropdown>

        </template>

        <template slot="awesome" scope="item">
          <a :href=item.item.reddit_query v-if=item.item.reddit_query><img :src='reddit_img' height="40"
                                                                           width="40"/></a>
          <a :href=item.item.hn_query v-if=item.item.hn_query><img src='static/hn.jpg' height="40"
                                                                   width="40"/></a>
          <a :href=item.item.trending_link v-if=item.item.trending_link><img src='static/trending.png' height="40"
                                                                             width="40"/></a>

        </template>
      </b-table>
    </div>
    <div class="row">
      <div id="lowerP">
        <b-pagination class="col-xs-4 col-xs-offset-4" size="s" :total-rows="currItems.length" :per-page="perPage"
                      variant="info"
                      secondary-variant="secondary" v-model="currentPage"/>
      </div>
    </div>
  </div>
</template>


<script>
  import data from '../../full_planet_python_history.json'

  export default {
    name: 'Main',
    data () {
      return {
        items: data,
        isBusy: false,
        searchDisabled: false,
        selected: '10',
        options: [{
          text: 'Last 10 days',
          value: '10'
        }, {
          text: 'Last 30 days',
          value: '30'
        }, {
          text: 'All time',
          value: '100000',
        }],
        fields: {
          name: {
            label: 'Repository',
            sortable: false
          },
          clean_last_mention: {
            label: 'Last mention',
            sortable: true
          },
          mention_count: {
            label: 'Num mention',
            sortable: true
          },
          forks: {
            label: 'Forks',
            sortable: true
          },
          starts: {
            label: 'Stars',
            sortable: true
          },
          awesome: {
            label: 'Featured On',

          },
          blogs_ref: {
            label: 'Blog posts'
          },
        },
        currentPage: 1,
        img: 'static/logo.png',
        reddit_img: 'static/reddit.png',

        perPage: 10,
        filter: null,
        currItems: [],
        objAsJson: [],
        now: new Date(),
        searchOption: {
          threshold: 0.1,
          location: 10,
          distance: 1000,
          maxPatternLength: 32,
          minMatchCharLength: 2,
          keys: [
            "description",
            "blogs_ref",
            "project_url"
          ]
        }
      }
    }
    ,
    methods: {
      myProvider: function (ctx) {
        // Apply local Sort
        this.isBusy = true;
        this.searchDisabled = true;
        if (this.selected) {
          this.currItems = [];
          this.items.forEach(function (k, i) {
            if (this.selected) {
              let last = new Date(k["last_mention"])
              if (((Math.round((this.now - last) / (1000 * 60 * 60 * 24)))) > this.selected) {
                return;
              }
            }

            this.currItems.push(k);

          }, this);
        }
        if (ctx["filter"]) {
          var searchHelper = new Fuse(this.currItems, this.searchOption); // "list" is the item array
          this.currItems = searchHelper.search(this.filter);
        }
        let sortKey = ctx.sortBy || "starts";
        if (this.currItems) {
          this.currItems = this.currItems.sort((a, b) => {
            const r = (a[sortKey] < b[sortKey]) ? 1 : -1;
            return ctx.sortDesc ? r : r * -1;
          });

        }
        this.isBusy = this.searchDisabled = false;
        return this.currItems.slice((this.currentPage - 1) * this.perPage, this.currentPage * this.perPage);

      }
      ,
      changeBusy: function () {
        this.$root.$emit('table::refresh', 'mainTable');
      }
    },
    computed: {
      numResults: function () {
        return this.currItems.length;
      }
    }
  }
</script>
<style>
  #nav {
    background-color: #7b5cb8;
    margin-bottom: 20px;
  }

  tr th:first-child,
  tr td:first-child {
    text-align: left;
  }

  #mainTable {
    width: 100%;
    max-width: 95%;
    margin: 3rem auto;
    margin-bottom: 0rem;
    margin-top: 0rem;
    display: table-row;
  }

  @media screen and (min-width: 1200px) {
    #mainTable {
      display: inline-table;

    }
  }

  th {
    text-align: center;
  }

  #subtitle {
    font-size: 1rem;
  }

  svg:not(:root) {
    z-index: 1;
  }

  .form-group {
    margin-left: 0.4rem;
  }

  #leftNav {
    margin-right: 3rem;
  }

  #lowerP {
    margin-top: 1rem;
    width: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  img {
    margin: 1px;
  }

  #searchResult {
    margin-top: 0.4rem;
    margin-bottom: 1rem;
    text-align: start;
  }

  #radioGroup {
    margin-top: 0.4rem;
    margin-bottom: 1rem;
    text-align: end;
    margin-right: 2rem;
  }

  #searchBar {
    margin-left: 0;

  }
</style>

