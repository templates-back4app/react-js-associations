import React, { useEffect, useState } from 'react';
import Parse from 'parse/dist/parse.min.js';
import './App.css';
import { Button, Divider, Input, Radio } from 'antd';
import { useHistory } from 'react-router-dom';
import { CloseOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

export const BookList = () => {
  const history = useHistory();

  // State variables
  const [publishers, setPublishers] = useState(null);
  const [authors, setAuthors] = useState(null);
  const [genres, setGenres] = useState(null);
  const [isbds, setIsbds] = useState(null);
  const [queryPublisher, setQueryPublisher] = useState('');
  const [queryAuthor, setQueryAuthor] = useState('');
  const [queryGenre, setQueryGenre] = useState('');
  const [queryIsbd, setQueryIsbd] = useState('');
  const [queriedBooks, setQueriedBooks] = useState([]);
  const [queryTitle, setQueryTitle] = useState('');
  const [queryOrdering, setQueryOrdering] = useState('ascending');
  const [queryYearFrom, setQueryYearFrom] = useState('');
  const [queryYearTo, setQueryYearTo] = useState('');

  // useEffect is called after the component is initially rendered and
  // after every other render
  useEffect(() => {
    async function getQueryChoices() {
      if (
        publishers === null &&
        authors === null &&
        genres === null &&
        isbds === null
      ) {
        // Query all choices
        for (let choiceObject of ['Publisher', 'Author', 'Genre', 'ISBD']) {
          let newQuery = new Parse.Query(choiceObject);
          try {
            let queryResults = await newQuery.find();
            // Be aware that empty or invalid queries return as an empty array
            // Set results to state variable
            if (choiceObject === 'Publisher') {
              setPublishers(queryResults);
            } else if (choiceObject === 'Author') {
              setAuthors(queryResults);
            } else if (choiceObject === 'Genre') {
              setGenres(queryResults);
            } else if (choiceObject === 'ISBD') {
              setIsbds(queryResults);
            }
          } catch (error) {
            // Error can be caused by lack of Internet connection
            alert(`Error! ${error.message}`);
            return false;
          }
        }
        queryBooks();
        return true;
      }
    }
    getQueryChoices();
  });

  const queryBooks = async function () {
    // These values are simple input or radio buttons with query choices
    // linked to state variables
    const queryOrderingValue = queryOrdering;
    const queryTitleValue = queryTitle;
    const queryYearFromValue = Number(queryYearFrom);
    const queryYearToValue = Number(queryYearTo);

    // These values also come from state variables linked to
    // the screen query fields, with its options being every
    // parse object instance saved on server from the referred class, which is
    // queried on screen load via useEffect; this variables retrieve the user choices
    // as a complete Parse.Object;
    const queryPublisherValue = queryPublisher;
    const queryGenreValue = queryGenre;
    const queryAuthorValue = queryAuthor;
    const queryIsbdValue = queryIsbd;

    // Create our Parse.Query instance so methods can be chained
    // Reading parse objects is done by using Parse.Query
    const parseQuery = new Parse.Query('Book');

    // Basic queries
    // Ordering (two options)
    if (queryOrderingValue === 'ascending') {
      parseQuery.addAscending('title');
    } else if (queryOrderingValue === 'descending') {
      parseQuery.addDescending('title');
    }
    // Title query
    if (queryTitleValue !== '') {
      // Be aware that contains is case sensitive
      parseQuery.contains('title', queryTitleValue);
    }
    // Year interval query
    if (queryYearFromValue !== 0 || queryYearToValue !== 0) {
      if (queryYearFromValue !== 0) {
        parseQuery.greaterThanOrEqualTo('year', queryYearFromValue);
      }
      if (queryYearToValue !== 0) {
        parseQuery.lessThanOrEqualTo('year', queryYearToValue);
      }
    }

    // Association queries
    // One-to-many queries
    if (queryPublisherValue !== '') {
      parseQuery.equalTo('publisher', queryPublisherValue);
    }
    if (queryGenreValue !== '') {
      parseQuery.equalTo('genre', queryGenreValue);
    }

    // One-to-one query
    if (queryIsbdValue !== '') {
      parseQuery.equalTo('isbd', queryIsbdValue);
    }

    // Many-to-many query
    // In this case, we need to retrieve books related to the chosen author
    if (queryAuthorValue !== '') {
      parseQuery.equalTo('authors', queryAuthorValue);
    }

    try {
      let books = await parseQuery.find();
      // Many-to-many objects retrieval
      // In this example we need to get every related author Parse.Object
      // and add it to our query result objects
      for (let book of books) {
        // This query is done by creating a relation and querying it
        let bookAuthorsRelation = book.relation('authors');
        book.authorsObjects = await bookAuthorsRelation.query().find();
      }
      setQueriedBooks(books);
      return true;
    } catch (error) {
      // Error can be caused by lack of Internet connection
      alert(`Error! ${error.message}`);
      return false;
    }
  };

  const clearQueryChoices = async function () {
    setQueryPublisher('');
    setQueryAuthor('');
    setQueryGenre('');
    setQueryIsbd('');
    setQueryTitle('');
    setQueryOrdering('ascending');
    setQueryYearFrom('');
    setQueryYearTo('');
    await queryBooks();
    return true;
  };

  return (
    <div>
      <div className="header">
        <img
          className="header_logo"
          alt="Back4App Logo"
          src={
            'https://blog.back4app.com/wp-content/uploads/2019/05/back4app-white-logo-500px.png'
          }
        />
        <p className="header_text_bold">{'React on Back4App'}</p>
        <p className="header_text">{'React Relations'}</p>
      </div>
      <div className="container">
        <div className="flex_between">
          <h2 className="heading">{'Book List'}</h2>
          <div className="flex">
            <Button
              onClick={() => history.push('/create-object/Publisher')}
              type="primary"
              className="heading_button"
              color={'#208AEC'}
              icon={<PlusOutlined />}
            >
              ADD PUBLISHER
            </Button>
            <Button
              onClick={() => history.push('/create-object/Genre')}
              type="primary"
              className="heading_button"
              color={'#208AEC'}
              icon={<PlusOutlined />}
            >
              ADD GENRE
            </Button>
            <Button
              onClick={() => history.push('/create-object/Author')}
              type="primary"
              className="heading_button"
              color={'#208AEC'}
              icon={<PlusOutlined />}
            >
              ADD AUTHOR
            </Button>
            <Button
              onClick={() => history.push('/create-book')}
              type="primary"
              className="heading_button"
              color={'#208AEC'}
              icon={<PlusOutlined />}
            >
              ADD BOOK
            </Button>
          </div>
        </div>
        <Divider />
        <div className="flex_between">
          <div className="flex_child">
            {/* Book list */}
            {queriedBooks !== null &&
              queriedBooks !== undefined &&
              queriedBooks.map((book, index) => (
                <div className="book" key={`${index}`}>
                  <p className="book_title">{`${book.get('title')}`}</p>
                  <p className="book_description">{`Publisher: ${book
                    .get('publisher')
                    .get('name')}, Year: ${book.get('year')}, ISBD: ${book
                    .get('isbd')
                    .get('name')}, Genre: ${book
                    .get('genre')
                    .get('name')}, Author(s): ${book.authorsObjects.map(
                    (author) => `${author.get('name')}`
                  )}`}</p>
                </div>
              ))}
            {queriedBooks !== null &&
            queriedBooks !== undefined &&
            queriedBooks.length <= 0 ? (
              <p>{'No books here!'}</p>
            ) : null}
          </div>
          <div className="flex_child">
            <h3 className="subheading">Search</h3>
            {/* Title text search */}
            <Input
              value={queryTitle}
              onChange={(event) => setQueryTitle(event.target.value)}
              placeholder="Book Title"
            />
            {/* Ascending and descending ordering by title */}
            <h3 className="subheading">Ordering</h3>
            <Radio.Group
              onChange={(event) => setQueryOrdering(event.target.value)}
              value={queryOrdering}
            >
              <div>
                <Radio value={'ascending'}>Title A-Z</Radio>
                <Radio value={'descending'}>Title Z-A</Radio>
              </div>
            </Radio.Group>
            {/* Publishing year interval */}
            <h3 className="subheading">Publishing Year</h3>
            <div className="flex_between">
              <Input
                className="flex_child_form"
                value={queryYearFrom}
                onChange={(event) => setQueryYearFrom(event.target.value)}
                placeholder="Year from"
              />
              <Input
                className="flex_child_form"
                value={queryYearTo}
                onChange={(event) => setQueryYearTo(event.target.value)}
                placeholder="Year to"
              />
            </div>
            {/* Publisher filter */}
            {publishers !== null && (
              <>
                <h3 className="subheading">Publisher</h3>
                <Radio.Group
                  onChange={(event) => setQueryPublisher(event.target.value)}
                  value={queryPublisher}
                >
                  <div>
                    {publishers.map((publisher, index) => (
                      <Radio key={`${index}`} value={publisher}>
                        {publisher.get('name')}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </>
            )}
            {/* Genre filter */}
            {genres !== null && (
              <>
                <h3 className="subheading">Genre</h3>
                <Radio.Group
                  onChange={(event) => setQueryGenre(event.target.value)}
                  value={queryGenre}
                >
                  <div>
                    {genres.map((genre, index) => (
                      <Radio key={`${index}`} value={genre}>
                        {genre.get('name')}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </>
            )}
            {/* Authors filter */}
            {authors !== null && (
              <>
                <h3 className="subheading">Author</h3>
                <Radio.Group
                  onChange={(event) => setQueryAuthor(event.target.value)}
                  value={queryAuthor}
                >
                  <div>
                    {authors.map((author, index) => (
                      <Radio key={`${index}`} value={author}>
                        {author.get('name')}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </>
            )}
            {/* ISBD filter */}
            {isbds !== null && (
              <>
                <h3 className="subheading">ISDBs</h3>
                <Radio.Group
                  onChange={(event) => setQueryIsbd(event.target.value)}
                  value={queryIsbd}
                >
                  <div>
                    {isbds.map((isbd, index) => (
                      <Radio key={`${index}`} value={isbd}>
                        {isbd.get('name')}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </>
            )}
            <div className="form_buttons">
              <Button
                onClick={queryBooks}
                type="primary"
                className="form_button form_input"
                color={'#208AEC'}
                icon={<SearchOutlined />}
              >
                QUERY
              </Button>
              <Button
                danger
                onClick={() => clearQueryChoices()}
                className="form_button"
                color={'#208AEC'}
                icon={<CloseOutlined />}
              >
                CLEAR QUERY CHOICES
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
