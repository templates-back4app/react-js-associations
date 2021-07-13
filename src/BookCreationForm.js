import React, { useEffect, useState } from 'react';
import Parse from 'parse/dist/parse.min.js';
import './App.css';
import { Button, Checkbox, Divider, Input, Radio } from 'antd';
import { useHistory } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

export const BookCreationForm = () => {
  // Navigation parameters
  const history = useHistory();

  // State variables
  const [publishers, setPublishers] = useState(null);
  const [authors, setAuthors] = useState(null);
  const [genres, setGenres] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookYear, setBookYear] = useState('');
  const [bookISBD, setBookISBD] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookAuthors, setBookAuthors] = useState([]);
  const [bookGenre, setBookGenre] = useState('');

  // useEffect is called after the component is initially rendered and
  // after every other render
  useEffect(() => {
    async function getFormChoices() {
      // This condition ensures that data is updated only if needed
      if (publishers === null && authors === null && genres === null) {
        // Query all choices
        for (let choiceObject of ['Publisher', 'Author', 'Genre']) {
          console.log(choiceObject);
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
            }
          } catch (error) {
            // Error can be caused by lack of Internet connection
            alert(`Error! ${error.message}`);
            return false;
          }
        }
        return true;
      }
    }
    getFormChoices();
  }, [publishers, authors, genres]);

  // Functions used by the screen components
  const createBook = async function () {
    try {
      // This values come from state variables linked to
      // the screen form fields, retrieving the user choices
      // as a complete Parse.Object, when applicable;
      const bookTitleValue = bookTitle;
      const bookYearValue = Number(bookYear);
      const bookISBDValue = bookISBD;
      // For example, bookPublisher holds the value from
      // RadioGroup field with its options being every
      // Publisher parse object instance saved on server, which is
      // queried on screen load via useEffect
      const bookPublisherObject = bookPublisher;
      const bookGenreObject = bookGenre;
      // bookAuthors can be an array of Parse.Objects, since the book
      // may have more than one Author
      const bookAuthorsObjects = bookAuthors;

      // Creates a new parse object instance
      let Book = new Parse.Object('Book');

      // Set data to parse object
      // Simple title field
      Book.set('title', bookTitleValue);

      // Simple number field
      Book.set('year', bookYearValue);

      // 1:1 relation, need to check for uniqueness of value before creating a new ISBD object
      let isbdQuery = new Parse.Query('ISBD');
      isbdQuery.equalTo('name', bookISBDValue);
      let isbdQueryResult = await isbdQuery.first();
      if (isbdQueryResult !== null && isbdQueryResult !== undefined) {
        // If first returns a valid object instance, it means that there
        // is at least one instance of ISBD with the informed value
        alert('Error! There is already an ISBD instance with this value!');
        return false;
      } else {
        // Create a new ISBD object instance to create a one-to-one relation on saving
        let ISBD = new Parse.Object('ISBD');
        ISBD.set('name', bookISBDValue);
        ISBD = await ISBD.save();
        // Set the new object to the new book object ISBD field
        Book.set('isbd', ISBD);
      }

      // One-to-many relations can be set in two ways:
      // add direct object to field (Parse will convert to pointer on save)
      Book.set('publisher', bookPublisherObject);
      // or add pointer to field
      Book.set('genre', bookGenreObject.toPointer());

      // many-to-many relation
      // Create a new relation so data can be added
      let authorsRelation = Book.relation('authors');
      // bookAuthorsObjects is an array of Parse.Objects,
      // you can add to relation by adding the whole array or object by object
      authorsRelation.add(bookAuthorsObjects);

      // After setting the values, save it on the server
      try {
        await Book.save();
        // Success
        alert('Success!');
        history.push('/');
        return true;
      } catch (error) {
        // Error can be caused by lack of Internet connection
        alert(`Error! ${error.message}`);
        return false;
      }
    } catch (error) {
      // Error can be caused by wrong type of values in fields
      alert(`Error! ${error}`);
      return false;
    }
  };

  const handlePressCheckboxAuthor = (author) => {
    if (bookAuthors.includes(author)) {
      setBookAuthors(bookAuthors.filter((bookAuthor) => bookAuthor !== author));
    } else {
      setBookAuthors(bookAuthors.concat([author]));
    }
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
      <div className={'container'}>
        <h2 className="heading">{'New Book'}</h2>
        <Divider />
        <Input
          className="form_input"
          value={bookTitle}
          onChange={(event) => setBookTitle(event.target.value)}
          placeholder="Title"
          size="large"
        />
        <Input
          className="form_input"
          value={bookYear}
          onChange={(event) => setBookYear(event.target.value)}
          placeholder="Publishing Year"
          size="large"
        />
        <Input
          value={bookISBD}
          onChange={(event) => setBookISBD(event.target.value)}
          placeholder="ISBD"
          size="large"
        />
        {publishers !== null && (
          <>
            <h3 className="subheading">Publisher</h3>
            <Radio.Group
              onChange={(event) => setBookPublisher(event.target.value)}
              value={bookPublisher}
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
        {genres !== null && (
          <>
            <h3 className="subheading">Genre</h3>
            <Radio.Group
              onChange={(event) => setBookGenre(event.target.value)}
              value={bookGenre}
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
        {authors !== null && (
          <>
            <h3 className="subheading">{'Author(s)'}</h3>
            <>
              {authors.map((author, index) => (
                <div key={`${index}`} className="checkbox_item">
                  <span className="checkbox_text">{author.get('name')}</span>
                  <Checkbox
                    onChange={(_e) => handlePressCheckboxAuthor(author)}
                    checked={bookAuthors.includes(author)}
                  ></Checkbox>
                </div>
              ))}
            </>
          </>
        )}
        <div className="form_buttons">
          <Button
            onClick={() => createBook()}
            type="primary"
            className="form_button"
            color={'#208AEC'}
            icon={<PlusOutlined />}
            size="large"
          >
            CREATE BOOK
          </Button>
        </div>
      </div>
    </div>
  );
};
