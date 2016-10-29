import { Application } from 'spectron';
import { expect } from 'chai';
import electronPath from 'electron';
import homeStyles from '../app/components/Home.css';
import ShortcutsStyles from '../app/components/Shortcuts.css';

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('main window', function spec() {
  this.timeout(10000);

  before(async () => {
    this.app = new Application({
      path: electronPath,
      args: ['.'],
    });
    return this.app.start();
  });

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  const findShortcuts = () => this.app.client.element(`.${ShortcutsStyles.Shortcuts}`);

  const findButtons = async () => {
    const { value } = await this.app.client.elements(`.${ShortcutsStyles.btn}`);
    return value.map(btn => btn.ELEMENT);
  };

  it('should open window', async () => {
    const { client, browserWindow } = this.app;

    await client.waitUntilWindowLoaded();
    await delay(500);
    const title = await browserWindow.getTitle();
    expect(title).to.equal('Hello Electron React!');
  });

  it('should to Shortcuts with click "to Shortcuts" link', async () => {
    const { client } = this.app;

    await client.click(`.${homeStyles.container} > a`);
    expect(await findShortcuts().getText()).to.equal('0');
  });

  it('should display updated count after increment button click', async () => {
    const { client } = this.app;

    const buttons = await findButtons();
    await client.elementIdClick(buttons[0]);  // +
    expect(await findShortcuts().getText()).to.equal('1');
  });

  it('should display updated count after descrement button click', async () => {
    const { client } = this.app;

    const buttons = await findButtons();
    await client.elementIdClick(buttons[1]);  // -
    expect(await findShortcuts().getText()).to.equal('0');
  });

  it('shouldnt change if even and if odd button clicked', async () => {
    const { client } = this.app;

    const buttons = await findButtons();
    await client.elementIdClick(buttons[2]);  // odd
    expect(await findShortcuts().getText()).to.equal('0');
  });

  it('should change if odd and if odd button clicked', async () => {
    const { client } = this.app;

    const buttons = await findButtons();
    await client.elementIdClick(buttons[0]);  // +
    await client.elementIdClick(buttons[2]);  // odd
    expect(await findShortcuts().getText()).to.equal('2');
  });

  it('should change if async button clicked and a second later', async () => {
    const { client } = this.app;

    const buttons = await findButtons();
    await client.elementIdClick(buttons[3]);  // async
    expect(await findShortcuts().getText()).to.equal('2');
    await delay(1000);
    expect(await findShortcuts().getText()).to.equal('3');
  });

  it('should back to home if back button clicked', async () => {
    const { client } = this.app;
    await client.element(
      `.${ShortcutsStyles.backButton} > a`
    ).click();

    expect(
      await client.isExisting(`.${homeStyles.container}`)
    ).to.be.true;
  });
});
