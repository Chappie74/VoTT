import React from "react";
import _ from "lodash";
import { AssetState, IAsset, IAssetMetadata,
    IProject, IRegion, ITag, IPoint } from "../../../../models/applicationState";
import { AssetService } from "../../../../services/assetService";
import { strings, interpolate } from "../../../../common/strings";
import {
    RadialChart, XYPlot, ArcSeries, Sunburst, Hint, DiscreteColorLegend,
    HorizontalGridLines, XAxis, YAxis, VerticalBarSeries,
} from "react-vis";
import "react-vis/dist/styles/radial-chart.scss";
import "react-vis/dist/styles/plot.scss";

/**
 * Required properties for Project Metrics
 * @member project - Current project to fill metrics table
 */
export interface IProjectMetricsProps {
    project: IProject;
}

export interface IProjectMetricsState {
    loading: boolean;
    hoveredCell: any;
    sourceAssets: IAsset[];
    projectAssetsMetadata: IAssetMetadata[];
}

/**
 * @name - Project Form
 * @description -
 */
export default class ProjectMetrics extends React.Component<IProjectMetricsProps, IProjectMetricsState> {
    public state = {
        loading: true,
        hoveredCell: null,
        sourceAssets: [],
        projectAssetsMetadata: [],
    };

    private tipStyle = {
        display: "flex",
        color: "#fff",
        background: "#000",
        alignItems: "center",
        padding: "5px",
    };

    private boxStyle = { height: "10px", width: "10px" };

    public async componentDidMount() {
        this.setState({
            loading: true,
        });

        await this.getAssetsAndMetadata();
    }

    public render() {
        return (
            <div className="condensed-list">
                <h6 className="condensed-list-header bg-darker-2 p-2">
                    <i className="fas fa-chart-bar" />
                    <span>{strings.projectMetrics.title}</span>
                </h6>
                <div className="condensed-list-body">
                    {this.state.loading &&
                        <div className="loading">
                            <i className="fas fa-circle-notch fa-spin fa-2x" />
                        </div>
                    }
                    {!this.state.loading &&
                        this.renderMetrics()
                    }
                </div>
            </div>
        );
    }

    private buildValue(hoveredCell) {
        const { radius, angle, angle0 } = hoveredCell;
        const truedAngle = (angle + angle0) / 2;
        return {
            x: radius * Math.cos(truedAngle),
            y: radius * Math.sin(truedAngle),
        };
    }

    private renderMetrics() {
        const sourceAssetCount = this.getSourceAssetCount();
        const taggedAssetCount = this.getTaggedAssetCount();
        const visitedAssetCount = this.getVisitedAssetsCount();
        const nonVistedAssetCount = sourceAssetCount - visitedAssetCount;

        const assetChartData = [
            {
                angle: visitedAssetCount,
                label: interpolate(strings.projectMetrics.visitedAssets, { count: visitedAssetCount }),
            },
            {
                angle: taggedAssetCount,
                label: interpolate(strings.projectMetrics.taggedAssets, { count: taggedAssetCount }),
            },
            {
                angle: nonVistedAssetCount,
                label: interpolate(strings.projectMetrics.nonVisitedAssets, { count: nonVistedAssetCount }),
            },
        ];

        const colors = ["#395ECC", "#C6FF7A", "#FF8161"];

        const myData = [
            {angle0: 0,
                angle: visitedAssetCount * 2 * Math.PI / sourceAssetCount,
                radius: 3, radius0: 2, color: 0, label: "1"},
            {angle0: 0,
                angle: taggedAssetCount * 2 * Math.PI / sourceAssetCount,
                radius: 2, radius0: 1, color: 2, label: "2"},
            {angle0: 0,
                angle: -(nonVistedAssetCount * 2 * Math.PI / sourceAssetCount),
                radius: 1, radius0: 0, color: 1, label: "3"},
        ];
        const COLORS = ["red", "green", "blue", "yellow",
                        "orange", "indego", "violet", "gray",
                        "white", "black", "teal", "crimson"];
        const DATA = {
            animation: true,
            title: "asset-count",
            children: [
                {
                    title: "Visited",
                    name: visitedAssetCount,
                    children: [
                        { title: "Tagged", bigness: 1, children: [], clr: "#7DFFA4",
                        name: taggedAssetCount, size: taggedAssetCount, dontRotateLabel: true},
                        { bigness: 1, children: [], clr: "#FFDF63", name: visitedAssetCount - taggedAssetCount,
                        title: "Not Tagged", size: visitedAssetCount - taggedAssetCount, dontRotateLabel: true},
                    ],
                    clr: "#89B5E8",
                    dontRotateLabel: true,
                    size: visitedAssetCount,
                },
                {
                    title: "Not Visited",
                    name: sourceAssetCount - visitedAssetCount,
                    bigness: 1,
                    children: [],
                    clr: "#EB7B58",
                    dontRotateLabel: true,
                    labelStyle: {
                        fontSize: 15,
                        fontWeight: "bold",
                        fontColor: "gray",
                    },
                    size: sourceAssetCount - visitedAssetCount,
                },
            ],
        };

        const tagChartData = [];
        this.getTagsCounts().forEach((value) => {
            tagChartData.push({
                x: value.tag.name,
                y: value.count,
                color: value.tag.color,
            });
        });

        const { hoveredCell } = this.state;

        const legend = [{title: "visited", color: "#89B5E8"},
                        {title: "not-visited", color: "#EB7B58"},
                        {title: "tagged", color: "#7DFFA4"},
                        {title: "not-tagged", color: "#FFDF63"}];

        return (
            <div className="m-3">
                <div>
                    <h4>{strings.projectMetrics.assetsSectionTitle}</h4>
                    <p className="my-1">
                        {strings.projectMetrics.totalAssetCount}:
                        <strong className="px-1 metric-total-asset-count">{sourceAssetCount}</strong><br/>
                        Total Visited:
                        <strong className="px-1 metric-total-visited-count">{this.getVisitedAssetsCount()}</strong>
                    </p>
                    {/* <RadialChart
                        className="asset-chart"
                        showLabels={true}
                        data={assetChartData}
                        width={300}
                        height={300} /> */}
                    {/* <XYPlot
                        xDomain={[-3, 3]}
                        yDomain={[-3, 3]}
                        width={300}
                        height={300}
                    >
                        <ArcSeries
                            animation={{
                                damping: 9,
                                stiffness: 300,
                            }}
                            showLabels={true}
                            radiusDomain={[0, 3]}
                            data={myData}
                            colorType={"category"}
                            colorRange={colors}
                        />
                    </XYPlot> */}
                    <DiscreteColorLegend
                        items={legend}/>
                    <Sunburst
                        data={DATA}
                        style={{ stroke: "#fff" }}
                        onValueMouseOver={(v) =>
                            this.setState({ hoveredCell: v.x && v.y ? v : null })
                        }
                        onValueMouseOut={(v) => this.setState({ hoveredCell: null })}
                        height={300}
                        margin={{ top: 50, bottom: 50, left: 50, right: 50 }}
                        getLabel={(d) => d.name}
                        getSize={(d) => d.bigness}
                        getColor={(d) => d.clr}
                        width={350}
                        padAngle={() => 0.02}
                        hideRootNode={true}
                    >
                        {hoveredCell ? (
                            <Hint value={this.buildValue(hoveredCell)}>
                                <div style={this.tipStyle}>
                                    <div style={{ ...this.boxStyle, background: hoveredCell.clr }} />
                                    {hoveredCell.title + ":  " + hoveredCell.size}
                                </div>
                            </Hint>
                        ) : null}
                    </Sunburst>
                </div>
                <div className="my-3">
                    <h4>{strings.projectMetrics.tagsSectionTitle}</h4>
                    <p className="my-1">
                        {strings.projectMetrics.totalTagCount}:
                        <strong className="px-1 metric-total-tag-count">{this.props.project.tags.length}</strong>
                    </p>
                    <p className="my-1">
                        {strings.projectMetrics.totalRegionCount}:
                        <strong className="px-1 metric-total-region-count">{this.getRegionsCount()}</strong>
                    </p>
                    <p className="my-1">
                        {strings.projectMetrics.avgTagCountPerAsset}:
                        <strong className="px-1 metric-avg-tag-count">{this.getAverageTagCount()}</strong>
                    </p>
                    <XYPlot className="tag-chart"
                        margin={{ bottom: 150 }}
                        xType="ordinal"
                        colorType="literal"
                        width={300}
                        height={400}>
                        <HorizontalGridLines />
                        <XAxis tickLabelAngle={-45} />
                        <YAxis />
                        <VerticalBarSeries
                            data={tagChartData}
                        />
                    </XYPlot>
                </div>
            </div>
        );
    }

    private async getAssetsAndMetadata() {
        const assetService = new AssetService(this.props.project);
        const sourceAssets = await assetService.getAssets();

        const assetsMap = this.props.project.assets;
        const assets = _.values(assetsMap);
        const projectAssetsMetadata = await assets.mapAsync((asset) => assetService.getAssetMetadata(asset));

        this.setState({
            loading: false,
            sourceAssets,
            projectAssetsMetadata,
        });
    }

    /**
     * Count the number of tagged images or video frames
     */
    private getTaggedAssetCount = () => {
        const metadata = this.state.projectAssetsMetadata;

        const taggedAssets = _.filter(metadata,
            (m) => {
                // ignore video asset root container
                return m.asset.state === AssetState.Tagged && m.regions.length > 0;
            });

        return taggedAssets.length;
    }

    /**
     * Count the avg number of tags per image or video frame
     */
    private getAverageTagCount = () => {
        const taggedAssetCount = this.getTaggedAssetCount();

        if (taggedAssetCount === 0) {
            return 0;
        }

        const tags = this.getAllTagReferences();
        return (tags.length / taggedAssetCount).toFixed(2);
    }

    /**
     * The number of visited image or video frames
     */
    private getVisitedAssetsCount = () => {
        const metadata = this.state.projectAssetsMetadata;
        const visitedAssets = _.filter(metadata, (m) => {
            return m.asset.state === AssetState.Visited || m.asset.state === AssetState.Tagged;
        });

        return visitedAssets.length;
    }

    /**
     * Total regions drawn on all assets
     */
    private getRegionsCount = () => {
        const regions = this.getRegions();
        return regions.length;
    }

    /**
     * Total number of source assets in the project
     *   Note: video frames are not counted, only the video container
     */
    private getSourceAssetCount = () => {
        const assets = this.state.projectAssetsMetadata.map((e) => e.asset.name);

        const sourceAssetNames = this.state.sourceAssets.map((e) => e.name);
        for (const sourceAssetName of sourceAssetNames) {
            if (assets.indexOf(sourceAssetName) < 0) {
                assets.push(sourceAssetName);
            }
        }
        return assets.length;
    }

    /**
     * a map of asset count per tag
     */
    private getTagsCounts = (): Map<string, { tag: ITag, count: number }> => {
        const projectTags = _.keyBy(this.props.project.tags, (tag) => tag.name);
        const tagReferences = this.getAllTagReferences();

        const map = new Map<string, { tag: ITag, count: number }>();
        tagReferences.forEach((t) => {
            const projectTag = projectTags[t];
            if (!projectTag) {
                return;
            }

            const tagMetric = map.get(t) || { tag: projectTag, count: 0 };
            tagMetric.count++;
            map.set(t, tagMetric);
        });

        this.props.project.tags.forEach((tag) => {
            if (!map.get(tag.name)) {
                map.set(tag.name, { tag, count: 0 });
            }
        });

        return map;
    }

    /**
     * retrieve the list of regions drawn
     */
    private getRegions = (): IRegion[] => {
        const assetsMetadata = this.state.projectAssetsMetadata;

        // find all assets with non-zero regions, extract regions
        const regions = [];
        assetsMetadata.forEach((m) => {
            if (m.regions.length > 0) {
                regions.push((m.regions));
            }
        });

        return _.flatten(regions);
    }

    /**
     * retrieve the list of tags assigned
     */
    private getAllTagReferences = (): string[] => {
        const regions = this.getRegions();

        const tags = [];
        regions.forEach((r) => {
            tags.push(r.tags);
        });

        return _.flatten<string>(tags);
    }
}
