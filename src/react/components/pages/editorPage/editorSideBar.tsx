import React from "react";
import { AutoSizer, List, Grid } from "react-virtualized";
import { IAsset, AssetState, ISize } from "../../../../models/applicationState";
import { AssetPreview } from "../../common/assetPreview/assetPreview";
import { strings } from "../../../../common/strings";

/**
 * Properties for Editor Side Bar
 * @member assets - Array of assets to be previewed
 * @member onAssetSelected - Function to call when asset from side bar is selected
 * @member selectedAsset - Asset initially selected
 * @member thumbnailSize - The size of the asset thumbnails
 */
export interface IEditorSideBarProps {
    assets: IAsset[];
    onAssetSelected: (asset: IAsset) => void;
    selectedAsset?: IAsset;
    thumbnailSize?: ISize;
}

/**
 * State for Editor Side Bar
 * @member selectedAsset - Asset selected from side bar
 */
export interface IEditorSideBarState {
    scrollToIndex: number;
}

/**
 * @name - Editor Side Bar
 * @description - Side bar for editor page
 */
export default class EditorSideBar extends React.Component<IEditorSideBarProps, IEditorSideBarState> {
    public state: IEditorSideBarState = {
        scrollToIndex: this.props.selectedAsset
            ? this.props.assets.findIndex((asset) => asset.id === this.props.selectedAsset.id)
            : 0,
    };

    private listRef: React.RefObject<List> = React.createRef();

    public render() {
        return (
            <div className="editor-page-sidebar-nav">
                <AutoSizer>
                    {({ height, width }) => (
                        <Grid
                            ref={this.listRef}
                            className="asset-list"
                            height={height}
                            width={width}
                            columnWidth={this.props.thumbnailSize.width}
                            columnCount={this.props.assets.length}
                            rowCount={1}
                            rowHeight={this.props.thumbnailSize.height}
                            cellRenderer={this.cellRenderer}
                            overscanRowCount={2}
                            scrollToIndex={this.state.scrollToIndex}
                        />
                    )}
                </AutoSizer>
            </div>
        );
    }

    public componentDidUpdate(prevProps: IEditorSideBarProps) {

        if (!prevProps.selectedAsset && !this.props.selectedAsset) {
            return;
        }

        if ((!prevProps.selectedAsset && this.props.selectedAsset) ||
            prevProps.selectedAsset.id !== this.props.selectedAsset.id) {
            this.selectAsset(this.props.selectedAsset);
        }
    }

    private selectAsset = (selectedAsset: IAsset): void => {
        const scrollToIndex = this.props.assets.findIndex((asset) => asset.id === selectedAsset.id);

        this.setState({
            scrollToIndex,
        }, () => {
            this.forceUpdate();
        });
    }

    private onAssetClicked = (asset: IAsset): void => {
        this.selectAsset(asset);
        this.props.onAssetSelected(asset);
    }

    private cellRenderer = ({ key, columnIndex, style }): JSX.Element => {
        const asset = this.props.assets[columnIndex];
        const selectedAsset = this.props.selectedAsset;

        return (
            <div key={key} style={style}
                className={this.getAssetCssClassNames(asset, selectedAsset)}
                onClick={() => this.onAssetClicked(asset)}>
                <div className="asset-item-image">
                    {this.renderBadges(asset)}
                    <AssetPreview asset={asset} />
                </div>
                <div className="asset-item-metadata">
                    <span className="asset-filename" title={asset.name}>{asset.name}</span>
                    {asset.size &&
                        <span>
                            {asset.size.width} x {asset.size.height}
                        </span>
                    }
                </div>
            </div>
        );
    }

    private renderBadges = (asset: IAsset): JSX.Element => {
        switch (asset.state) {
            case AssetState.Tagged:
                return (
                    <span title={strings.editorPage.tagged}
                        className="badge badge-tagged">
                        <i className="fas fa-tag"></i>
                    </span>
                );
            case AssetState.Visited:
                return (
                    <span title={strings.editorPage.visited}
                        className="badge badge-visited">
                        <i className="fas fa-eye"></i>
                    </span>
                );
            default:
                return null;
        }
    }

    private getAssetCssClassNames = (asset: IAsset, selectedAsset: IAsset = null): string => {
        const cssClasses = ["asset-item"];
        if (selectedAsset && selectedAsset.id === asset.id) {
            cssClasses.push("selected");
        }

        return cssClasses.join(" ");
    }
}
