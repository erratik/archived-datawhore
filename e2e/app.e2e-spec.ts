import { DatawhoreAdminPage } from './app.po';

describe('datawhore-admin App', function() {
  let page: DatawhoreAdminPage;

  beforeEach(() => {
    page = new DatawhoreAdminPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
