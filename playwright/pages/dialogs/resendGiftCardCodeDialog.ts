import { Page } from "@playwright/test";

export class ResendGiftCardCodeDialog {
  readonly page: Page;

  constructor(
    page: Page,
    readonly resendButton = page.getByTestId("submit"),
  ) {
    this.page = page;
  }

  async blur() {
    await this.page.keyboard.press("Tab");
  }

  async clickResendButton() {
    await this.resendButton.click();
    await this.resendButton.waitFor({ state: "hidden" });
  }
}
