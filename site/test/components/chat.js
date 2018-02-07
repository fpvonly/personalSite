const React = require('react');
const {expect} = require('chai');
const {mount} = require('enzyme');
const ReactRouterEnzymeContext = require('react-router-enzyme-context');
const TestServer = require('../chat-test-server.js');

import Utils from '../../src/components/Utils.js';
import Chat from '../../src/components/Chat/Chat.jsx';
import ChatArea from '../../src/components/Chat/ChatArea.jsx';
import ChatLogin from '../../src/components/Chat/ChatLogin.jsx';
import ChatAreaMessage from '../../src/components/Chat/ChatAreaMessage.jsx';

// start chat test server (not the actual production server)
TestServer();

describe('<Chat> component and sub-components', function() {

  after(() => {
    TestServer.stop();
  });

  Utils.setlocalStorageItem('chat_name', '', 86400); // set chat login credentials
  const options = new ReactRouterEnzymeContext();

  let wrapper = mount(<Chat siteLoginStatus={false} />, options.get());
  wrapper.setContext({
    loginState: {}
  });

  describe('STATE: LOGGEDOUT', function() {

    it('component state is correct before logging in', () => {
      expect(wrapper.state('STATUS')).to.equal('LOGGEDOUT');
    });

    it('<ChatLogin> should have login fields and button visible', function() {
      expect(wrapper.find('#chat_reg').length).to.equal(1);
      expect(wrapper.find('#reg_btn').length).to.equal(1);
    });

    it('<ChatArea> should NOT have loader icon visible', function() {
      expect(wrapper.find(ChatArea).render().find('.chat_message_loader').length).to.equal(0);
    });

  }); // ENDS STATE: LOGGEDOUT

  describe('STATE: LOADING', function() {

    before(() => {
      // set necessary chat login data
      let input = wrapper.find('#chat_name');
      input.instance().value = 'test';
      wrapper.find('#reg_btn').simulate('click');
    });

    it('component state is correct while logging in', (done) =>  {
      setTimeout(() => {
        expect(wrapper.state('STATUS')).to.equal('LOADING');
        //wrapper.update(); // force child component to re-render
        done();
      }, 500);
    });

    it('<ChatLogin> should have login fields still visible', function() {
      expect(wrapper.find('#chat_reg').length).to.equal(1);
    });

    it('<ChatArea> should have loader icon visible', function() {
      expect(wrapper.find(ChatArea).render().find('.chat_message_loader').length).to.equal(1);
    });

  }); // ENDS STATE: LOADING

  describe('STATE: LOGGEDIN', function() {

    it('component state is correct after logging in', (done) =>  {
      setTimeout(() => {
        expect(wrapper.state('STATUS')).to.equal('LOGGEDIN');
        expect(wrapper.state('messages').length).to.equal(1);
        expect(wrapper.state('messages')[0].custom).to.equal('Welcome. Logged in.');
        wrapper.update(); // force child component to re-render
        done();
      }, 1500);
    });

    it('<ChatLogin> should have login NO fields visible', function() {
      expect(wrapper.find('#chat_reg').length).to.equal(0);
    });

    it('<ChatArea> should have NO loader icon visible', function() {
      expect(wrapper.find('.chat_message_loader').length).to.equal(0);
    });

    it('<ChatArea> should have message text input field and send button visible', function() {
      expect(wrapper.find('#message_input').length).to.equal(1);
      expect(wrapper.find('#message_send_btn').length).to.equal(1);
    });

    it('<ChatAreaMessage> welcome message should have been rendered in the message area', function() {
      expect(wrapper.find(ChatArea).render().find('.message').length).to.equal(1);
    });

  }); // ENDS STATE: LOGGEDIN

  describe('STATE: LOGGEDIN - sending a message', function() {

    before(() => {
      let input = wrapper.find('#message_input');
      input.instance().value = 'test message content';
      wrapper.find('#message_send_btn').simulate('click');
    });

    it('component state is correct while logging in', (done) =>  {
      setTimeout(() => {
        expect(wrapper.state('STATUS')).to.equal('LOGGEDIN');
        expect(wrapper.state('messages').length).to.equal(2);
        expect(wrapper.state('messages')[1].custom).to.equal('Welcome. Logged in.');
        expect(wrapper.state('messages')[0].message).to.equal('test message content');
        //wrapper.update(); // force child component to re-render
        done();
      }, 500);
    });

    it('<ChatAreaMessage> messages should have been rendered in the message area', function() {
      expect(wrapper.find(ChatArea).render().find('.message').length).to.equal(2);
    });

    it('<ChatAreaMessage> sent message should have an edit button', function() {
      expect(wrapper.find(ChatArea).render().find('.message').first().find('.edit_btn').length).to.equal(1);

    });

    after(() => {
      wrapper.update();
      wrapper.find('.message').first().find('.edit_btn').simulate('click'); // click on edit button
    });

  }); // ENDS STATE: LOGGEDIN - sending a message

  describe('STATE: LOGGEDIN - editing and saving a message', function() {

    before(() => {
      let textarea = wrapper.find('.message').first().find('.edit_message_textarea');
      textarea.instance().value = 'test message content EDITED';
      let saveBtn = wrapper.find('.message').first().find('.save_btn');
      saveBtn.simulate('click');
    });

    it('<ChatAreaMessage> message was edited correctly', (done) =>  {
      setTimeout(() => {
        expect(wrapper.find(ChatArea).render().find('.message').first().find('.message_text_span').text()).to.equal('test message content EDITED');
        done();
      }, 1500);
    });

  }); // ENDS STATE: LOGGEDIN - clicking on message edit button

  describe('STATE: LOGGEDOUT - connection closed', function() {

    before(() => {
      TestServer.stop();
    });

    it('component state is correct while logging in', (done) =>  {
      setTimeout(() => {
        wrapper.update();
        expect(wrapper.state('STATUS')).to.equal('LOGGEDOUT');
        //wrapper.update(); // force child component to re-render
        done();
      }, 500);
    });

    it('<ChatAreaMessage> no messages should be rendered', function() {
      expect(wrapper.find(ChatArea).render().find('.message').length).to.equal(0);
    });

    it('<ChatLogin> should have login fields and button visible again', function() {
      expect(wrapper.find('#chat_reg').length).to.equal(1);
      expect(wrapper.find('#reg_btn').length).to.equal(1);
    });

  }); // ENDS STATE: LOGGEDOUT - connection closed

});