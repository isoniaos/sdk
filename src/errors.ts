export interface IsoniaApiErrorOptions {
  readonly method: string;
  readonly path: string;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly responseText: string;
}

export class IsoniaApiError extends Error {
  readonly method: string;
  readonly path: string;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly responseText: string;

  constructor(options: IsoniaApiErrorOptions) {
    super(
      `Isonia API request failed: ${options.method} ${options.path} returned ${options.status}`,
    );
    this.name = "IsoniaApiError";
    this.method = options.method;
    this.path = options.path;
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
    this.responseText = options.responseText;
  }
}
