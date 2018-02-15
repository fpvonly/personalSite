const React = require('react');
const {expect} = require('chai');
const assert = require('assert');
const {mount} = require('enzyme');
const ReactRouterEnzymeContext = require('react-router-enzyme-context');

import Header from '../../components/Header.jsx';

describe('<Header> component', function() {
  const options = new ReactRouterEnzymeContext();
  let logInMock = () => {};
  let wrapper = mount(<Header loginStatus={true} loginError={false} logIn={logInMock} />, options.get());

  after(() => {
    wrapper.unmount();
  });

  it('should have correct html structure', function() {
    assert.equal(wrapper.find('.full_header').first().length, 1);
    assert.equal(wrapper.find('.full_header').find('.wrapper_navi').length, 1);
    assert.equal(wrapper.find('.full_header .wrapper_navi').find('.main_logo').length, 1);
    assert.equal(wrapper.find('.full_header .wrapper_navi .main_logo').find('.logo img').length, 1);
  });

  it('should have correct props', function() {
    expect(wrapper.prop('loginStatus')).to.equal(true);
    expect(wrapper.prop('loginError')).to.equal(false);
    expect(wrapper.prop('logIn')).to.equal(logInMock);
  });

});
