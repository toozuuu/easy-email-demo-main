import {uniqueId} from 'lodash';

interface Options {
    limit?: number;
    accept?: string;
    minSize?: number;
    maxSize?: number;
    autoUpload?: boolean;
}

interface UploaderOption extends Options {
    limit: number;
}

export type UploadItem = {
    idx: string;
    url: string;
    status: 'pending' | 'done' | 'error';
};

export type UploaderEventMap = {
    start: (data: UploadItem[]) => void;
    progress: (data: UploadItem[]) => void;
    end: (data: UploadItem[]) => void;
};

type UploaderEventMapHandle = {
    [K in keyof UploaderEventMap]: UploaderEventMap[K][];
};

export type UploaderServer = (file: File) => Promise<string>;

export class Uploader {
    private readonly options: UploaderOption;
    private readonly el: HTMLInputElement;
    private readonly uploadServer: UploaderServer;
    private handler: UploaderEventMapHandle = {
        start: [],
        progress: [],
        end: [],
    };

    constructor(uploadServer: UploaderServer, options: Options) {
        this.options = {
            limit: 1,
            autoUpload: true,
            ...options,
        };
        this.uploadServer = uploadServer;
        this.el = this.createInput();
    }

    public async uploadFiles(files: File[]) {
        const results = files.map((file) => ({file}));
        const uploadList: UploadItem[] = results.map((item) => ({
            url: '',
            status: 'pending',
            idx: `uploader-${uniqueId()}`,
        }));

        this.handler.start.map((fn) => fn(uploadList));

        await PromiseEach(
            results.map(async (file, index) => {
                try {
                    uploadList[index].url = await this.uploadFile(file);
                    uploadList[index].status = 'done';
                } catch (error) {
                    uploadList[index].status = 'error';
                } finally {
                    this.handler.progress.map((fn) => fn(uploadList));
                }
            })
        );

        this.handler.end.map((fn) => fn(uploadList));
    }

    public chooseFile() {
        const el = this.el;
        document.body.appendChild(el);
        el.click();

        return new Promise<File[]>((resolve) => {
            el.onchange = async (e: any) => {
                let files = e.target.files || [];
                files = Array.prototype.slice.call(files);
                if (files.length === 0) {
                    return;
                }
                this.checkFile(files);
                if (this.options.autoUpload) {
                    this.uploadFiles(files);
                } else {
                    resolve(files)
                }
                el.onchange = null;
                el.parentNode && el.parentNode.removeChild(el);
            };
        })
    }

    public on<K extends keyof UploaderEventMap>(
        event: K,
        fn: UploaderEventMap[K]
    ) {
        // UploaderEventMapHandle[K] === UploaderEventMap[K][]
        const handler = this.handler[event] as UploaderEventMap[K][];
        handler.push(fn);
    }

    public off<K extends keyof UploaderEventMap>(
        event: K,
        fn: UploaderEventMap[K]
    ) {
        const handles = this.handler[event] as UploaderEventMap[K][];
        this.handler[event] = handles.filter(
            (item) => item !== fn
        ) as UploaderEventMapHandle[K];
    }

    private createInput() {
        Array.from(document.querySelectorAll('.uploader-form-input')).forEach(
            (el) => {
                el && document.body.removeChild(el);
            }
        );
        const el = document.createElement('input');
        el.className = 'uploader-form-input';
        el.type = 'file';
        el.style.display = 'block';
        el.style.opacity = '0';
        el.style.width = '0';
        el.style.height = '0';
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.overflow = 'hidden';
        el.multiple = this.options.limit > 1;
        if (this.options.accept) {
            el.accept = this.options.accept;
        }
        return el;
    }

    private async uploadFile(result: { file: File; }) {
        return this.uploadServer(result.file);
    }

    private checkFile(files: File[]) {
        const typeError = this.checkTypes(files);
        if (typeError) {
            throw new Error(typeError);
        }

        const sizeError = this.checkSize(files);
        if (sizeError) {
            throw new Error(sizeError);
        }
    }

    private checkTypes(files: File[]) {
        const accept = this.options.accept;
        if (accept) {
            let fileType = '';
            if (accept.indexOf('image') !== -1) {
                fileType = 'image';
            } else if (accept.indexOf('video') !== -1) {
                fileType = 'video';
            }
            for (const file of files) {
                if (file.type.indexOf(fileType) !== 0) {
                    return '上传文件类型错误!';
                }
            }
        }
        return null;
    }

    private checkSize(files: File[]) {
        const options = this.options;
        for (const file of files) {
            if (options.minSize && file.size < options.minSize) {
                return `上传文件不能小于 ${options.minSize}`;
            }
            if (options.maxSize && file.size > options.maxSize) {
                return `上传文件不能小于 ${options.maxSize}`;
            }
        }
        return null;
    }
}

export function PromiseEach(promiseLikes: PromiseLike<any>[]) {
    const datas: Array<any> = [];
    let count = 0;
    return new Promise((resolve) => {
        promiseLikes.forEach(async (promiseLike) => {
            try {
                const data = await promiseLike;
                datas.push(data);
            } catch (error) {
                datas.push(error);
            } finally {
                count++;
                if (count === promiseLikes.length) {
                    resolve(true);
                }
            }
        });
    });
}

