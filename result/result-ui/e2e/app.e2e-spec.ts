import { ResultUiPage } from './app.po';

describe('result-ui App', () => {
  let page: ResultUiPage;

  beforeEach(() => {
    page = new ResultUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
