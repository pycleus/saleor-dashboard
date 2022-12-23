import {
  CopyIcon,
  GraphiQLProvider,
  GraphiQLProviderProps,
  PrettifyIcon,
  QueryEditor,
  ToolbarButton,
  Tooltip,
  UnStyledButton,
  useCopyQuery,
  useDragResize,
  useEditorContext,
  UseHeaderEditorArgs,
  usePluginContext,
  usePrettifyEditors,
  UseQueryEditorArgs,
  UseResponseEditorArgs,
  UseVariableEditorArgs,
  WriteableEditorProps,
} from '@graphiql/react';
import { useTheme } from "@saleor/macaw-ui";
import React, {
  ComponentType,
  PropsWithChildren,
  ReactNode,
} from 'react';

export interface GraphiQLToolbarConfig {
  /**
   * This content will be rendered after the built-in buttons of the toolbar.
   * Note that this will not apply if you provide a completely custom toolbar
   * (by passing `GraphiQL.Toolbar` as child to the `GraphiQL` component).
   */
  additionalContent?: React.ReactNode;
}

export type GraphiQLProps = Omit<GraphiQLProviderProps, 'children'> &
  GraphiQLInterfaceProps;

export function GraphiQL({
  dangerouslyAssumeSchemaIsValid,
  defaultQuery,
  defaultTabs,
  externalFragments,
  fetcher,
  getDefaultFieldNames,
  headers,
  initialTabs,
  inputValueDeprecation,
  introspectionQueryName,
  maxHistoryLength,
  onEditOperationName,
  onSchemaChange,
  onTabChange,
  onTogglePluginVisibility,
  operationName,
  plugins,
  query,
  response,
  schema,
  schemaDescription,
  shouldPersistHeaders,
  storage,
  validationRules,
  variables,
  visiblePlugin,
  defaultHeaders,
  ...props
}: GraphiQLProps) {
  // Ensure props are correct
  if (typeof fetcher !== 'function') {
    throw new TypeError(
      'The `GraphiQL` component requires a `fetcher` function to be passed as prop.',
    );
  }

  return (
    <GraphiQLProvider
      getDefaultFieldNames={getDefaultFieldNames}
      dangerouslyAssumeSchemaIsValid={dangerouslyAssumeSchemaIsValid}
      defaultQuery={defaultQuery}
      defaultHeaders={defaultHeaders}
      defaultTabs={defaultTabs}
      externalFragments={externalFragments}
      fetcher={fetcher}
      headers={headers}
      initialTabs={initialTabs}
      inputValueDeprecation={inputValueDeprecation}
      introspectionQueryName={introspectionQueryName}
      maxHistoryLength={maxHistoryLength}
      onEditOperationName={onEditOperationName}
      onSchemaChange={onSchemaChange}
      onTabChange={onTabChange}
      onTogglePluginVisibility={onTogglePluginVisibility}
      plugins={plugins}
      visiblePlugin={visiblePlugin}
      operationName={operationName}
      query={query}
      response={response}
      schema={schema}
      schemaDescription={schemaDescription}
      shouldPersistHeaders={shouldPersistHeaders}
      storage={storage}
      validationRules={validationRules}
      variables={variables}
    >
      <GraphiQLInterface {...props} />
    </GraphiQLProvider>
  );
}
// Export main windows/panes to be used separately if desired.
GraphiQL.Toolbar = GraphiQLToolbar;

type AddSuffix<Obj extends Record<string, any>, Suffix extends string> = {
  [Key in keyof Obj as `${string & Key}${Suffix}`]: Obj[Key];
};

export type GraphiQLInterfaceProps = WriteableEditorProps &
  AddSuffix<Pick<UseQueryEditorArgs, 'onEdit'>, 'Query'> &
  Pick<UseQueryEditorArgs, 'onCopyQuery'> &
  AddSuffix<Pick<UseVariableEditorArgs, 'onEdit'>, 'Variables'> &
  AddSuffix<Pick<UseHeaderEditorArgs, 'onEdit'>, 'Headers'> &
  Pick<UseResponseEditorArgs, 'responseTooltip'> & {
    children?: ReactNode;
    /**
     * Set the default state for the editor tools.
     * - `false` hides the editor tools
     * - `true` shows the editor tools
     * - `'variables'` specifically shows the variables editor
     * - `'headers'` specifically shows the headers editor
     * By default the editor tools are initially shown when at least one of the
     * editors has contents.
     */
    defaultEditorToolsVisibility?: boolean | 'variables' | 'headers';
    /**
     * Toggle if the headers editor should be shown inside the editor tools.
     * @default true
     */
    isHeadersEditorEnabled?: boolean;
    /**
     * An object that allows configuration of the toolbar next to the query
     * editor.
     */
    toolbar?: GraphiQLToolbarConfig;
  };

export function GraphiQLInterface(props: GraphiQLInterfaceProps) {
  const editorContext = useEditorContext({ nonNull: true });
  const pluginContext = usePluginContext();

  const copy = useCopyQuery({ onCopyQuery: props.onCopyQuery });
  const prettify = usePrettifyEditors();

  const PluginContent = pluginContext?.visiblePlugin?.content;

  const pluginResize = useDragResize({
    defaultSizeRelation: 1 / 3,
    direction: 'horizontal',
    initiallyHidden: pluginContext?.visiblePlugin ? undefined : 'first',
    onHiddenElementChange: resizableElement => {
      if (resizableElement === 'first') {
        // pluginContext?.setVisiblePlugin(null);
      }
    },
    sizeThresholdSecond: 200,
    storageKey: 'docExplorerFlex',
  });
  const editorResize = useDragResize({
    direction: 'horizontal',
    storageKey: 'editorFlex',
  });
  const editorToolsResize = useDragResize({
    defaultSizeRelation: 3,
    direction: 'vertical',
    // initiallyHidden: (() => {
    //   if (
    //     props.defaultEditorToolsVisibility === 'variables' ||
    //     props.defaultEditorToolsVisibility === 'headers'
    //   ) {
    //     return undefined;
    //   }

    //   if (typeof props.defaultEditorToolsVisibility === 'boolean') {
    //     return props.defaultEditorToolsVisibility ? undefined : 'second';
    //   }

    //   return editorContext.initialVariables || editorContext.initialHeaders
    //     ? undefined
    //     : 'second';
    // })(),
    sizeThresholdSecond: 60,
    storageKey: 'secondaryEditorFlex',
  });

  // const [showDialog, setShowDialog] = useState<
  //   'settings' | 'short-keys' | null
  // >(null);

  const children = React.Children.toArray(props.children);

  const toolbar = children.find(child =>
    isChildComponentType(child, GraphiQL.Toolbar),
  ) || (
    <>
      <ToolbarButton
        onClick={() => prettify()}
        label="Prettify query (Shift-Ctrl-P)"
      >
        <PrettifyIcon className="graphiql-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton onClick={() => copy()} label="Copy query (Shift-Ctrl-C)">
        <CopyIcon className="graphiql-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
      {props.toolbar?.additionalContent || null}
    </>
  );

  const onClickReference = () => {
    if (pluginResize.hiddenElement === 'first') {
      pluginResize.setHiddenElement(null);
    }
  };

  // const modifier =
  //   window.navigator.platform.toLowerCase().indexOf('mac') === 0 ? (
  //     <code className="graphiql-key">Cmd</code>
  //   ) : (
  //     <code className="graphiql-key">Ctrl</code>
  //   );

  const theme = useTheme()
  const rootStyle = {
    "--font-size-body": theme.typography.body2.fontSize,
    "--font-size-h2": theme.typography.h3.fontSize,
    "--font-size-h3": theme.typography.h3.fontSize,
    "--font-size-h4": theme.typography.h4.fontSize,
    "--font-size-hint": theme.typography.caption.fontSize,
    "--font-size-inline-code": theme.typography.caption.fontSize,
  } as React.CSSProperties;

  return (
    <div data-testid="graphiql-container" className="graphiql-container" style={rootStyle}>
      <div className="graphiql-sidebar">
        <div className="graphiql-sidebar-section">
          {pluginContext?.plugins.map(plugin => {
            const isVisible = plugin === pluginContext.visiblePlugin;
            const label = `${isVisible ? 'Hide' : 'Show'} ${plugin.title}`;
            const Icon = plugin.icon;
            return (
              <Tooltip key={plugin.title} label={label}>
                <UnStyledButton
                  type="button"
                  className={isVisible ? 'active' : ''}
                  onClick={() => {
                    if (isVisible) {
                      pluginContext.setVisiblePlugin(null);
                      pluginResize.setHiddenElement('first');
                    } else {
                      pluginContext.setVisiblePlugin(plugin);
                      pluginResize.setHiddenElement(null);
                    }
                  }}
                  aria-label={label}
                >
                  <Icon aria-hidden="true" />
                </UnStyledButton>
              </Tooltip>
            );
          })}
        </div>
        <div className="graphiql-sidebar-section">
          {/* <Tooltip label="Open short keys dialog">
            <UnStyledButton
              type="button"
              onClick={() => setShowDialog('short-keys')}
              aria-label="Open short keys dialog"
            >
              <KeyboardShortcutIcon aria-hidden="true" />
            </UnStyledButton>
          </Tooltip> */}
        </div>
      </div>
      <div className="graphiql-main">
        <div
          ref={pluginResize.firstRef}
          style={{
            // Make sure the container shrinks when containing long
            // non-breaking texts
            minWidth: '200px',
          }}
        >
          <div className="graphiql-plugin">
            {PluginContent ? <PluginContent /> : null}
          </div>
        </div>
        <div ref={pluginResize.dragBarRef}>
          {pluginContext?.visiblePlugin ? (
            <div className="graphiql-horizontal-drag-bar" />
          ) : null}
        </div>
        <div ref={pluginResize.secondRef} style={{ minWidth: 0 }}>
          <div className="graphiql-sessions">
            <div
              role="tabpanel"
              id="graphiql-session"
              className="graphiql-session"
              style={{padding: '2rem 0 0 0'}}
              aria-labelledby={`graphiql-session-tab-${editorContext.activeTabIndex}`}
            >
              <div ref={editorResize.firstRef}>
                <div
                  className="graphiql-editors full-height"
                  style={{boxShadow: "none"}}
                >
                  <div ref={editorToolsResize.firstRef}>
                    <section
                      className="graphiql-query-editor"
                      aria-label="Query Editor"
                      style={{borderBottom: 0}}
                    >
                      <div className="graphiql-query-editor-wrapper" style={{fontSize: '1.6rem'}}>
                        <QueryEditor
                          editorTheme={props.editorTheme}
                          keyMap={props.keyMap}
                          onClickReference={onClickReference}
                          onCopyQuery={props.onCopyQuery}
                          onEdit={props.onEditQuery}
                          readOnly={props.readOnly}
                        />
                      </div>
                      <div
                        className="graphiql-toolbar"
                        role="toolbar"
                        aria-label="Editor Commands"
                      >
                        {toolbar}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Dialog
        isOpen={showDialog === 'short-keys'}
        onDismiss={() => setShowDialog(null)}
      >
        <div className="graphiql-dialog-header">
          <div className="graphiql-dialog-title">Short Keys</div>
          <Dialog.Close onClick={() => setShowDialog(null)} />
        </div>
        <div className="graphiql-dialog-section">
          <div>
            <table className="graphiql-table">
              <thead>
                <tr>
                  <th>Short key</th>
                  <th>Function</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">F</code>
                  </td>
                  <td>Search in editor</td>
                </tr>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">K</code>
                  </td>
                  <td>Search in documentation</td>
                </tr>
                <tr>
                  <td>
                    {modifier}
                    {' + '}
                    <code className="graphiql-key">Enter</code>
                  </td>
                  <td>Execute query</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">P</code>
                  </td>
                  <td>Prettify editors</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">M</code>
                  </td>
                  <td>Merge fragments definitions into operation definition</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">C</code>
                  </td>
                  <td>Copy query</td>
                </tr>
                <tr>
                  <td>
                    <code className="graphiql-key">Ctrl</code>
                    {' + '}
                    <code className="graphiql-key">Shift</code>
                    {' + '}
                    <code className="graphiql-key">R</code>
                  </td>
                  <td>Re-fetch schema using introspection</td>
                </tr>
              </tbody>
            </table>
            <p>
              The editors use{' '}
              <a
                href="https://codemirror.net/5/doc/manual.html#keymaps"
                target="_blank"
                rel="noopener noreferrer"
              >
                CodeMirror Key Maps
              </a>{' '}
              that add more short keys. This instance of Graph<em>i</em>QL uses{' '}
              <code>{props.keyMap || 'sublime'}</code>.
            </p>
          </div>
        </div>
      </Dialog> */}
    </div>
  );
}

// Configure the UI by providing this Component as a child of GraphiQL.
function GraphiQLToolbar<TProps>(props: PropsWithChildren<TProps>) {
  return <>{props.children}</>;
}

GraphiQLToolbar.displayName = 'GraphiQLToolbar';

// Determines if the React child is of the same type of the provided React component
function isChildComponentType<T extends ComponentType>(
  child: any,
  component: T,
): child is T {
  if (
    child?.type?.displayName &&
    child.type.displayName === component.displayName
  ) {
    return true;
  }

  return child.type === component;
}

export default GraphiQL;