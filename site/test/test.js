import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import jsdom from 'jsdom-global';

Enzyme.configure({ adapter: new Adapter() });

require('./components/Header.js');
