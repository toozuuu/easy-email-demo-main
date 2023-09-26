import React, {useCallback, useEffect, useState} from "react";
import {EmailEditor, EmailEditorProvider, IEmailTemplate, Stack} from "easy-email-editor";
import templateData from "../../template.json";
import newTemplate from "../../newTemplate.json";
import {useImportTemplate} from "../../hooks/useImportTemplate";
import {useExportTemplate} from "../../hooks/useExportTemplate";
import {useWindowSize} from "react-use";
import mjml from "mjml-browser";
import {AdvancedType, JsonToMjml} from "easy-email-core";
import {Button, message, PageHeader} from "antd";
import {FormApi} from "final-form";
import {ExtensionProps, StandardLayout} from "easy-email-extensions";
import {useParams} from "react-router-dom";


const fontList = [
    'Arial',
    'Tahoma',
    'Verdana',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Lato',
    'Montserrat'
].map(item => ({value: item, label: item}));

const categories: ExtensionProps['categories'] = [
    {
        label: 'Content',
        active: true,
        blocks: [
            {
                type: AdvancedType.TEXT,
            },
            {
                type: AdvancedType.IMAGE,
                payload: {attributes: {padding: '0px 0px 0px 0px'}},
            },
            {
                type: AdvancedType.BUTTON,
            },
            {
                type: AdvancedType.SOCIAL,
            },
            {
                type: AdvancedType.DIVIDER,
            },
            {
                type: AdvancedType.SPACER,
            },
            {
                type: AdvancedType.HERO,
            },
            {
                type: AdvancedType.WRAPPER,
            },
        ],
    },
    {
        label: 'Layout',
        active: true,
        displayType: 'column',
        blocks: [
            {
                title: '2 columns',
                payload: [
                    ['50%', '50%'],
                    ['33%', '67%'],
                    ['67%', '33%'],
                    ['25%', '75%'],
                    ['75%', '25%'],
                ],
            },
            {
                title: '3 columns',
                payload: [
                    ['33.33%', '33.33%', '33.33%'],
                    ['25%', '25%', '50%'],
                    ['50%', '25%', '25%'],
                ],
            },
            {
                title: '4 columns',
                payload: [[['25%', '25%', '25%', '25%']]],
            },
        ],
    },
];

export default function Editor() {
    const [downloadFileName, setDownloadName] = useState('download.mjml');
    // @ts-ignore
    let [, setTemplate] = useState<IEmailTemplate['content']>(templateData);
    const [initialValues, setInitialValues] = useState<any>({
        content: templateData
    });

    const {importTemplate} = useImportTemplate();
    const {exportTemplate} = useExportTemplate();

    const {width} = useWindowSize();

    const smallScene = width < 1400;
    const [apiData, setApiData] = useState();
    const [getParam, setParam] = useState<string>();
    const {type} = useParams();

    useEffect(() => {
        setParam(type);

        if (type === 'new') {
            setInitialValues({
                content: newTemplate
            });
        }
    }, [type]);

    const onExportHTML = (values: IEmailTemplate) => {
        // @ts-ignore
        const html = mjml(JsonToMjml({
            data: values.content,
            mode: 'production',
            context: values.content
        }), {
            beautify: true,
            validationLevel: 'soft',
        }).html;

        const blob = new Blob([html], {type: "text/html"});

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "template.html";  // Set desired filename here

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        message.success('Exported HTML file!');
    };

    const onImportMjml = async () => {
        try {
            const [filename, data] = await importTemplate();
            setDownloadName(filename);
            setTemplate(data);
            setInitialValues({
                content: data
            });

            message.success('Imported mjml file!');

        } catch (error) {
            message.error('Invalid mjml file');
        }
    };

    const onExportMjml = (values: IEmailTemplate) => {
        exportTemplate(
            downloadFileName,
            JsonToMjml({
                data: values.content,
                mode: 'production',
                context: values.content
            }))

        message.success('Exported mjml file!');
    };

    const onSubmit = useCallback(
        async (
            values: IEmailTemplate,
            form: FormApi<IEmailTemplate, Partial<IEmailTemplate>>
        ) => {
            console.log('values', values)

            // form.restart(newValues); replace new values form backend
            message.success('Saved success!')
        },
        []
    );

    async function fetchData() {

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({title: "hello 1111"});
            }, 2000); // 4 seconds delay
        });
    }

    useEffect(() => {
        fetchAPIData();
    }, [])

    const fetchAPIData = async () => {
        const result = await fetchData();
        // @ts-ignore
        setApiData(result)
    }

    useEffect(() => {
        if (!apiData) return;

        const updateNestedChildren = (children: any) => {
            for (let child of children) {
                if (child.data && child.data.value && child.data.value.type === "@TITLE") {
                    // @ts-ignore
                    child.data.value.content = `<p>${apiData.title}</p>`;
                }
                if (child.children) {
                    updateNestedChildren(child.children);
                }
            }
        };

        const copyOfTemplate = {...initialValues.content};
        updateNestedChildren(copyOfTemplate.children);
        setInitialValues({...initialValues, content: copyOfTemplate});

    }, [apiData, getParam]);


    if (!initialValues) return null;

    return (
        <div>
            <EmailEditorProvider
                dashed={false}
                data={initialValues}
                height={'calc(100vh - 85px)'}
                autoComplete
                fontList={fontList}
                onSubmit={onSubmit}
            >
                {({values}, {submit}) => {
                    return (
                        <>
                            <PageHeader
                                title='Edit'
                                extra={
                                    <Stack alignment="center">
                                        <Button onClick={() => onExportHTML(values)}>
                                            Export Html
                                        </Button>
                                        <Button onClick={() => onExportMjml(values)}>
                                            Export Template
                                        </Button>
                                        <Button onClick={onImportMjml}>
                                            Import Template
                                        </Button>
                                        <Button
                                            type='primary'
                                            onClick={() => submit()}
                                        >
                                            Save
                                        </Button>
                                    </Stack>
                                }
                            />

                            <StandardLayout
                                compact={!smallScene}
                                categories={categories}
                                showSourceCode={true}
                            >
                                <EmailEditor/>
                            </StandardLayout>
                        </>
                    );
                }}
            </EmailEditorProvider>
        </div>
    );

}
